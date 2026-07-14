output "vpc_id" { value = aws_vpc.main.id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "vpc_cidr_block" { value = aws_vpc.main.cidr_block }

# Add this!
output "public_subnet_ids" { 
  value = aws_subnet.public[*].id 
}