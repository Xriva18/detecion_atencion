import sys
import os

print("Executable:", sys.executable)
print("Path:", sys.path)

try:
    import google
    print("Google package path:", google.__path__)
    print("Google file:", google.__file__)
except Exception as e:
    print("Error importing google:", e)

try:
    import google.genai
    print("SUCCESS: Imported google.genai")
    print("File:", google.genai.__file__)
except Exception as e:
    print("Error importing google.genai:", e)

try:
    from google import genai
    print("SUCCESS: from google import genai")
except Exception as e:
    print("Error doing 'from google import genai':", e)
