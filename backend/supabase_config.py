import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file in root directory
load_dotenv()

# Get environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")  # Use service role key

# Initialize Supabase client with service role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Get storage client
storage = supabase.storage 
