#!/bin/bash


# Script to generate the IV and KEY

KEY=$(openssl rand -hex 16)
IV=$(openssl rand -hex 8)

echo "KEY is $KEY"
echo "IV is $IV"