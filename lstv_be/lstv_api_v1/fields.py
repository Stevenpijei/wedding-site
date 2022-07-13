from django.db.models.lookups import In as LookupIn
from django.db.models import Field


@Field.register_lookup
class NotIn(LookupIn):
    lookup_name = "notin"

    def get_rhs_op(self, connection, rhs):
        return "NOT IN %s" % rhs
