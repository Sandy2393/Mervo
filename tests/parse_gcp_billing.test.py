import json
import tempfile
from scripts.parse_gcp_billing import main as parse_main
import sys


def run_parser(input_path):
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as out:
        sys.argv = ["parse_gcp_billing.py", "--input", input_path, "--output", out.name, "--dry-run"]
        parse_main()


def test_parses_sample_csv():
    run_parser("examples/sample_billing_input/gcp_billing_sample.csv")
