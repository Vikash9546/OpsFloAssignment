# Domain model layer representing Complaint entities.
#
# Because Prisma ORM generates python models dynamically in the virtual environment
# packages (under `prisma.models`), this file can be used as a reference to define
# domain entity validation, standard constants, or additional utility methods.
#
# To use the active database Complaint model directly:
# from prisma.models import Complaint

from typing import Literal

# Strictly defined classification and priority constants
IssueType = Literal["Electrical", "Mechanical", "Sensor", "Unknown"]
PriorityLevel = Literal["Low", "Medium", "High"]

ALLOWED_ISSUE_TYPES = {"Electrical", "Mechanical", "Sensor", "Unknown"}
ALLOWED_PRIORITIES = {"Low", "Medium", "High"}
