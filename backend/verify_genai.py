import sys
print("Executable:", sys.executable)
try:
    from google import genai
    print("SUCCESS: from google import genai")
    print("Version:", genai.__version__)
    print("File:", genai.__file__)
except Exception as e:
    print("FAIL:", e)
