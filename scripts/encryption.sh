#!/bin/bash


# Script to generate the IV and KEY

KEY=$(openssl rand -hex 32)
IV=$(openssl rand -hex 16)

echo "KEY is $KEY"
echo "IV is $IV"