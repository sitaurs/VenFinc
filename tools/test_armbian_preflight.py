import tempfile
import unittest
from pathlib import Path

from armbian_preflight import benchmark_cpu, benchmark_storage, parse_meminfo


class ParseMeminfoTests(unittest.TestCase):
    def test_kib_values_are_converted_to_bytes_and_malformed_lines_ignored(self):
        memory = parse_meminfo(
            "MemTotal:       1024 kB\n"
            "MemAvailable:    512 kB\n"
            "SwapTotal:       0 kB\n"
            "Broken:          nope kB\n"
            "No separator\n"
        )

        self.assertEqual(memory, {"MemTotal": 1024 * 1024, "MemAvailable": 512 * 1024, "SwapTotal": 0})


class BenchmarkTests(unittest.TestCase):
    def test_cpu_benchmark_is_bounded_and_reports_work(self):
        result = benchmark_cpu(0.1)

        self.assertGreater(result["iterations"], 0)
        self.assertLessEqual(result["durationSeconds"], 1)
        self.assertGreater(result["sha256MiBPerSecond"], 0)

    def test_storage_benchmark_verifies_and_removes_its_temporary_file(self):
        with tempfile.TemporaryDirectory() as directory:
            result = benchmark_storage(Path(directory), 1)

            self.assertEqual(result["sizeMiB"], 1)
            self.assertIs(result["readBackChecksumVerified"], True)
            self.assertGreater(result["writeMiBPerSecond"], 0)
            self.assertGreater(result["readMiBPerSecond"], 0)
            self.assertEqual(list(Path(directory).iterdir()), [])


if __name__ == "__main__":
    unittest.main()
