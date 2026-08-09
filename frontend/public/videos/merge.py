import os
import subprocess
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
video_dir = r"d:\MediMind\frontend\public\videos"

video_files = [
    "21178637.mp4",
    "video_preview_h264 (1).mp4",
    "video_preview_h264.mp4",
    "watermarked_preview.mp4"
]

print("FFmpeg exe:", ffmpeg_exe)

# Create filter_complex command to scale and pad all videos to 1920x1080 @ 30fps and concatenate them
inputs = []
filter_parts = []

for i, v in enumerate(video_files):
    v_path = os.path.join(video_dir, v)
    inputs.extend(["-i", v_path])
    # Scale each video to fit inside 1920x1080 maintaining aspect ratio, pad with black, setsar 1, fps 30
    filter_parts.append(
        f"[{i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,"
        f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30[v{i}];"
    )

concat_inputs = "".join([f"[v{i}]" for i in range(len(video_files))])
filter_complex = "".join(filter_parts) + f"{concat_inputs}concat=n={len(video_files)}:v=1:a=0[outv]"

output_path = os.path.join(video_dir, "hero-bg-merged.mp4")

cmd = [
    ffmpeg_exe,
    "-y",
    *inputs,
    "-filter_complex", filter_complex,
    "-map", "[outv]",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "22",
    "-pix_fmt", "yuv420p",
    output_path
]

print("Running command...")
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0:
    print("SUCCESS: Merged video created at", output_path)
else:
    print("ERROR:", result.stderr)
