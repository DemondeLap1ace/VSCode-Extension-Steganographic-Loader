provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

resource "aws_security_group" "instance_sg" {
  name        = "instance-security-group"
  description = "Allow TLS inbound traffic"

  tags = {
    Name = "instance-sg"
  }
}