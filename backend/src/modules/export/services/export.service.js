/**
 * Export Service — وفاء (Wafa)
 *
 * Generates reports in PDF and Excel formats.
 *
 * PDF: Uses a lightweight HTML-to-PDF approach (returns HTML for browser print)
 * Excel: Generates CSV (opens in Excel directly) — keeps backend dependency-free
 *
 * For full PDF generation with pdfkit/puppeteer, see the README.
 */

const Patient = require('../../auth/models/Patient.model');
const Medication = require('../../medications/models/Medication.model');
const DoseEvent = require('../../doses/models/DoseEvent.model');
const Doctor = require('../../auth/models/Doctor.model');
const { logger } = require('../../../sheared/utils/logger');

class ExportService {

  /**
   * Generate patient adherence report as HTML (for PDF print)
   * @param {String} patientId - Patient ID
   * @param {Number} period - Days (7, 30, 90)
   */
  async generatePatientReportHTML(patientId, period = 30) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    const [events, medications] = await Promise.all([
      DoseEvent.find({
        patientId,
        scheduledFor: { $gte: startDate }
      }).populate('medicationId', 'name formType'),
      Medication.find({ patientId, isActive: true })
    ]);

    const taken = events.filter(e => e.status === 'TAKEN').length;
    const missed = events.filter(e => e.status === 'MISSED').length;
    const skipped = events.filter(e => e.status === 'SKIPPED').length;
    const total = events.length;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    // Build daily breakdown
    const dailyBreakdown = this._buildDailyBreakdown(events, period);

    // Build per-medication stats
    const medStats = medications.map(med => {
      const medEvents = events.filter(e =>
        e.medicationId && (
          (e.medicationId._id.equals && e.medicationId._id.equals(med._id)) ||
          String(e.medicationId._id) === String(med._id)
        )
      );
      const medTaken = medEvents.filter(e => e.status === 'TAKEN').length;
      const medTotal = medEvents.length;
      return {
        name: med.name,
        formType: med.formType,
        isChronic: med.isChronic,
        taken: medTaken,
        total: medTotal,
        missed: medEvents.filter(e => e.status === 'MISSED').length,
        rate: medTotal > 0 ? Math.round((medTaken / medTotal) * 100) : 0
      };
    });

    const html = this._buildHTMLReport({
      patient,
      period,
      startDate,
      endDate: new Date(),
      summary: { taken, missed, skipped, total, adherenceRate },
      dailyBreakdown,
      medStats
    });

    return html;
  }

  /**
   * Generate patient report as CSV (Excel-compatible)
   */
  async generatePatientReportCSV(patientId, period = 30) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    const [events, medications] = await Promise.all([
      DoseEvent.find({
        patientId,
        scheduledFor: { $gte: startDate }
      }).populate('medicationId', 'name'),
      Medication.find({ patientId, isActive: true })
    ]);

    const rows = [];

    // Header section
    rows.push(['تقرير الالتزام بالأدوية — وفاء (Wafa)']);
    rows.push(['']);
    rows.push(['اسم المريض', `${patient.firstName} ${patient.lastName}`]);
    rows.push(['رقم الموبايل', patient.phone]);
    rows.push(['الفترة', `آخر ${period} يوم`]);
    rows.push(['تاريخ التقرير', new Date().toLocaleString('ar-EG')]);
    rows.push(['']);

    // Summary
    const taken = events.filter(e => e.status === 'TAKEN').length;
    const missed = events.filter(e => e.status === 'MISSED').length;
    const total = events.length;
    const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

    rows.push(['ملخص الالتزام']);
    rows.push(['إجمالي الجرعات', total]);
    rows.push(['جرعات مأخودة', taken]);
    rows.push(['جرعات فاتت', missed]);
    rows.push(['نسبة الالتزام', `${rate}%`]);
    rows.push(['']);

    // Per-medication breakdown
    rows.push(['تفصيل كل دواء']);
    rows.push(['اسم الدواء', 'نوعه', 'مزمن؟', 'مأخودة', 'فاتت', 'الإجمالي', 'نسبة الالتزام']);

    medications.forEach(med => {
      const medEvents = events.filter(e =>
        e.medicationId && String(e.medicationId._id) === String(med._id)
      );
      const medTaken = medEvents.filter(e => e.status === 'TAKEN').length;
      const medMissed = medEvents.filter(e => e.status === 'MISSED').length;
      const medTotal = medEvents.length;
      const medRate = medTotal > 0 ? Math.round((medTaken / medTotal) * 100) : 0;

      rows.push([
        med.name,
        med.formType,
        med.isChronic ? 'نعم' : 'لا',
        medTaken,
        medMissed,
        medTotal,
        `${medRate}%`
      ]);
    });
    rows.push(['']);

    // Daily breakdown
    rows.push(['الالتزام اليومي']);
    rows.push(['التاريخ', 'اليوم', 'مأخودة', 'الإجمالي', 'النسبة']);

    const daily = this._buildDailyBreakdown(events, period);
    daily.forEach(d => {
      rows.push([
        d.date,
        d.dayName,
        d.taken,
        d.total,
        `${d.rate}%`
      ]);
    });

    // Convert to CSV
    const csv = rows.map(row =>
      row.map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    // Add BOM for Excel UTF-8 detection
    return '\ufeff' + csv;
  }

  /**
   * Generate doctor's panel report as CSV
   */
  async generateDoctorReportCSV(doctorAccountId, period = 30) {
    const doctor = await Doctor.findOne({ accountId: doctorAccountId });
    if (!doctor) throw new Error('Doctor not found');

    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    const events = await DoseEvent.find({
      patientId: { $in: doctor.patientIds },
      scheduledFor: { $gte: startDate }
    }).populate('patientId', 'firstName lastName').populate('medicationId', 'name');

    const rows = [];

    // Header
    rows.push(['تقرير الأطباء — وفاء (Wafa)']);
    rows.push(['']);
    rows.push(['اسم الطبيب', doctor.fullName]);
    rows.push(['التخصص', doctor.specialty]);
    rows.push(['الفترة', `آخر ${period} يوم`]);
    rows.push(['تاريخ التقرير', new Date().toLocaleString('ar-EG')]);
    rows.push(['']);

    // Per-patient breakdown
    rows.push(['تفصيل المرضى']);
    rows.push(['اسم المريض', 'إجمالي الجرعات', 'مأخودة', 'فاتت', 'نسبة الالتزام', 'الحالة']);

    const patients = await Patient.find({ _id: { $in: doctor.patientIds } })
      .select('firstName lastName');

    patients.forEach(patient => {
      const patientEvents = events.filter(e =>
        e.patientId && String(e.patientId._id) === String(patient._id)
      );
      const taken = patientEvents.filter(e => e.status === 'TAKEN').length;
      const missed = patientEvents.filter(e => e.status === 'MISSED').length;
      const total = patientEvents.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
      const status = rate >= 80 ? 'ملتزم' : rate >= 50 ? 'متوسط' : 'غير ملتزم';

      rows.push([
        `${patient.firstName} ${patient.lastName}`,
        total,
        taken,
        missed,
        `${rate}%`,
        status
      ]);
    });

    const csv = rows.map(row =>
      row.map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    return '\ufeff' + csv;
  }

  // ===== PRIVATE: Build daily breakdown =====
  _buildDailyBreakdown(events, period) {
    const days = [];
    const now = new Date();

    for (let i = period - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEvents = events.filter(e =>
        e.scheduledFor >= dayStart && e.scheduledFor <= dayEnd
      );

      const taken = dayEvents.filter(e => e.status === 'TAKEN').length;
      const total = dayEvents.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      days.push({
        date: dayStart.toISOString().split('T')[0],
        dayName: dayStart.toLocaleDateString('ar-EG', { weekday: 'long' }),
        taken,
        total,
        rate
      });
    }

    return days;
  }

  // ===== PRIVATE: Build HTML report (for PDF print) =====
  _buildHTMLReport(data) {
    const { patient, period, summary, dailyBreakdown, medStats } = data;

    // Build daily chart bars
    const maxTotal = Math.max(...dailyBreakdown.map(d => d.total), 1);
    const chartBars = dailyBreakdown.map(d => {
      const takenHeight = d.total > 0 ? (d.taken / maxTotal) * 100 : 0;
      const missedHeight = d.total > 0 ? ((d.total - d.taken) / maxTotal) * 100 : 0;
      return `<div class="bar-group">
        <div class="bar-container">
          <div class="bar bar-missed" style="height: ${missedHeight}%"></div>
          <div class="bar bar-taken" style="height: ${takenHeight}%"></div>
        </div>
        <div class="bar-label">${d.dayName.substring(0, 3)}</div>
      </div>`;
    }).join('');

    // Build medication table rows
    const medRows = medStats.map(m => `
      <tr>
        <td>${m.name}</td>
        <td>${m.formType}</td>
        <td>${m.isChronic ? 'نعم' : 'لا'}</td>
        <td>${m.taken}</td>
        <td>${m.missed}</td>
        <td>${m.total}</td>
        <td class="${m.rate >= 80 ? 'good' : m.rate >= 50 ? 'fair' : 'poor'}">${m.rate}%</td>
      </tr>
    `).join('');

    const adherenceColor = summary.adherenceRate >= 80 ? '#10B981' :
                          summary.adherenceRate >= 50 ? '#F59E0B' : '#EF4444';

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير الالتزام — ${patient.firstName} ${patient.lastName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Cairo', sans-serif;
    padding: 40px;
    color: #0F172A;
    background: #FFFFFF;
  }
  .header {
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 3px solid #0EA5E9;
  }
  .logo {
    display: inline-block;
    background: linear-gradient(135deg, #0EA5E9, #0369A1);
    color: white;
    padding: 12px 24px;
    border-radius: 16px;
    font-size: 28px;
    font-weight: 900;
    margin-bottom: 12px;
  }
  .header h1 { font-size: 24px; margin-bottom: 8px; }
  .header p { color: #64748B; font-size: 14px; }
  .patient-info {
    background: #F8FAFC;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .patient-info div { font-size: 14px; }
  .patient-info strong { color: #0369A1; }
  .summary {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 32px;
  }
  .stat-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }
  .stat-card .number { font-size: 28px; font-weight: 900; color: #0369A1; }
  .stat-card .label { font-size: 11px; color: #64748B; margin-top: 4px; }
  .stat-card.adherence { background: ${adherenceColor}20; border-color: ${adherenceColor}; }
  .stat-card.adherence .number { color: ${adherenceColor}; }
  h2 { font-size: 18px; margin-bottom: 16px; color: #0F172A; }
  .chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 200px;
    background: #F8FAFC;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 32px;
  }
  .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
  .bar-container { width: 100%; flex: 1; display: flex; flex-direction: column-reverse; }
  .bar { width: 100%; transition: height 0.3s; }
  .bar-taken { background: #10B981; border-radius: 4px 4px 0 0; }
  .bar-missed { background: #EF4444; }
  .bar-label { font-size: 9px; color: #64748B; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  th { background: #0369A1; color: white; padding: 10px; text-align: right; font-size: 13px; }
  td { padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px; }
  tr:nth-child(even) { background: #F8FAFC; }
  .good { color: #10B981; font-weight: bold; }
  .fair { color: #F59E0B; font-weight: bold; }
  .poor { color: #EF4444; font-weight: bold; }
  .footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #E2E8F0;
    color: #64748B;
    font-size: 12px;
  }
  @media print {
    body { padding: 20px; }
    .stat-card, .patient-info { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">💊 وفاء</div>
    <h1>تقرير الالتزام بالأدوية</h1>
    <p>الفترة: آخر ${period} يوم • تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</p>
  </div>

  <div class="patient-info">
    <div><strong>اسم المريض:</strong> ${patient.firstName} ${patient.lastName}</div>
    <div><strong>رقم الموبايل:</strong> ${patient.phone}</div>
    <div><strong>تاريخ الميلاد:</strong> ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('ar-EG') : '—'}</div>
    <div><strong>فصيلة الدم:</strong> ${patient.bloodType || '—'}</div>
  </div>

  <div class="summary">
    <div class="stat-card adherence">
      <div class="number">${summary.adherenceRate}%</div>
      <div class="label">نسبة الالتزام</div>
    </div>
    <div class="stat-card">
      <div class="number">${summary.total}</div>
      <div class="label">إجمالي الجرعات</div>
    </div>
    <div class="stat-card">
      <div class="number">${summary.taken}</div>
      <div class="label">مأخودة</div>
    </div>
    <div class="stat-card">
      <div class="number">${summary.missed}</div>
      <div class="label">فاتت</div>
    </div>
    <div class="stat-card">
      <div class="number">${summary.skipped}</div>
      <div class="label">متجاوزة</div>
    </div>
  </div>

  <h2>📈 الالتزام اليومي</h2>
  <div class="chart">${chartBars}</div>

  <h2>💊 تفصيل كل دواء</h2>
  <table>
    <thead>
      <tr>
        <th>الدواء</th>
        <th>النوع</th>
        <th>مزمن؟</th>
        <th>مأخودة</th>
        <th>فاتت</th>
        <th>الإجمالي</th>
        <th>الالتزام</th>
      </tr>
    </thead>
    <tbody>${medRows}</tbody>
  </table>

  <div class="footer">
    💊 وفاء — منصة إدارة الأدوية ومتابعة المرضى<br>
    تم توليد هذا التقرير تلقائياً بواسطة منصة وفاء في ${new Date().toLocaleString('ar-EG')}
  </div>
</body>
</html>`;
  }
}

module.exports = new ExportService();
