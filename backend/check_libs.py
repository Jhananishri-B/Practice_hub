
try:
    import numpy
    print(f"numpy: {numpy.__version__}")
except ImportError:
    print("numpy: MISSING")

try:
    import pandas
    print(f"pandas: {pandas.__version__}")
except ImportError:
    print("pandas: MISSING")

try:
    import sklearn
    print(f"sklearn: {sklearn.__version__}")
except ImportError:
    print("sklearn: MISSING")

try:
    import matplotlib
    print(f"matplotlib: {matplotlib.__version__}")
except ImportError:
    print("matplotlib: MISSING")

try:
    import tensorflow
    print(f"tensorflow: {tensorflow.__version__}")
except ImportError:
    print("tensorflow: MISSING")

try:
    import torch
    print(f"torch: {torch.__version__}")
except ImportError:
    print("torch: MISSING")

try:
    import boto3
    print(f"boto3: {boto3.__version__}")
except ImportError:
    print("boto3: MISSING")
