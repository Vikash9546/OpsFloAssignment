import unittest
from app.services.classifier_service import ClassifierService
from app.services.priority_service import PriorityService
from app.services.summary_service import SummaryService
from app.services.ticket_service import TicketService

class TestMaintainerAIServices(unittest.TestCase):
    def setUp(self):
        self.classifier = ClassifierService()
        self.priority = PriorityService()
        self.summary_service = SummaryService()
        self.ticket_service = TicketService()

    def test_classifier_service(self):
        # Valid category normalization
        self.assertEqual(self.classifier.validate_classification("electrical"), "Electrical")
        self.assertEqual(self.classifier.validate_classification("MECHANICAL"), "Mechanical")
        self.assertEqual(self.classifier.validate_classification("  Sensor  "), "Sensor")
        self.assertEqual(self.classifier.validate_classification("Unknown"), "Unknown")
        
        # Invalid categories fallback to Unknown
        self.assertEqual(self.classifier.validate_classification("Hydraulic"), "Unknown")
        self.assertEqual(self.classifier.validate_classification(None), "Unknown")
        self.assertEqual(self.classifier.validate_classification(""), "Unknown")

    def test_priority_service(self):
        # Valid priority normalization
        self.assertEqual(self.priority.validate_priority("high"), "High")
        self.assertEqual(self.priority.validate_priority("MEDIUM"), "Medium")
        self.assertEqual(self.priority.validate_priority("  low  "), "Low")
        
        # Invalid priorities fallback to Medium
        self.assertEqual(self.priority.validate_priority("Urgent"), "Medium")
        self.assertEqual(self.priority.validate_priority(None), "Medium")
        self.assertEqual(self.priority.validate_priority(""), "Medium")

    def test_summary_service(self):
        # Normal sanitization
        original = "The coolant valve is stuck in the closed position causing temperature spikes."
        summary = "Coolant valve is stuck closed causing temperature spikes."
        self.assertEqual(self.summary_service.sanitize_summary(summary, original), summary)

        # Trimming outer quotes
        self.assertEqual(self.summary_service.sanitize_summary('"Stuck coolant valve"', original), "Stuck coolant valve")
        self.assertEqual(self.summary_service.sanitize_summary("'Stuck coolant valve'", original), "Stuck coolant valve")

        # Empty/whitespace fallback to original complaint (truncated if too long)
        self.assertEqual(self.summary_service.sanitize_summary("", original), original)
        self.assertEqual(self.summary_service.sanitize_summary("   ", original), original)
        
        long_complaint = "A" * 100
        truncated_expected = ("A" * 77) + "..."
        self.assertEqual(self.summary_service.sanitize_summary("", long_complaint), truncated_expected)

    def test_ticket_service_fallback(self):
        # Check generated fallback conforms to TKT-YYYY-XXXX pattern
        year_prefix = "TKT-2026-"
        fallback_id = self.ticket_service._generate_fallback_id(year_prefix)
        self.assertTrue(fallback_id.startswith(year_prefix))
        self.assertEqual(len(fallback_id), len("TKT-2026-0000"))
        
        # Extract the sequence number and check if it is numeric
        seq_part = fallback_id.split("-")[2]
        self.assertTrue(seq_part.isdigit())

if __name__ == "__main__":
    unittest.main()
