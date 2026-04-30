import os
import sys

# This allows the generated _grpc file to find the _pb2 file
# regardless of how the package is imported.
sys.path.append(os.path.dirname(os.path.realpath(__file__)))