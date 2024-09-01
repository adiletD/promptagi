#!/bin/bash

# Activate the virtual environment
source venv/bin/activate

# Refresh the requirements.txt
pip freeze > requirements.txt

# Deactivate the virtual environment
deactivate
