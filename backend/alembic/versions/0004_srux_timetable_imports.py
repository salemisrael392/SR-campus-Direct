"""Add SRUX timetable subscriptions and source-entry mappings."""

from alembic import op
import sqlalchemy as sa


revision = "0004_srux_timetable_imports"
down_revision = "0003_auth_personal_timetable"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # One SRUX subscription per student.
    op.create_table(
        "timetable_imports",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("user_id", sa.Text(), nullable=False),
        sa.Column(
            "source",
            sa.Text(),
            nullable=False,
            server_default="srux",
        ),
        sa.Column("degree", sa.Text(), nullable=False),
        sa.Column("academic_year", sa.Text(), nullable=False),
        sa.Column("batch_id", sa.Text(), nullable=False),
        sa.Column("source_etag", sa.Text(), nullable=True),
        sa.Column("source_last_modified", sa.Text(), nullable=True),
        sa.Column("source_last_updated", sa.Text(), nullable=True),
        sa.Column("last_checked_at", sa.DateTime(), nullable=True),
        sa.Column(
            "last_successful_sync_at",
            sa.DateTime(),
            nullable=True,
        ),
        sa.Column(
            "sync_status",
            sa.Text(),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.current_timestamp(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.current_timestamp(),
        ),
        sa.CheckConstraint(
            "source = 'srux'",
            name="timetable_imports_source_check",
        ),
        sa.CheckConstraint(
            "sync_status IN ('pending', 'synced', 'stale', 'error')",
            name="timetable_imports_sync_status_check",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["public.users.id"],
            name="timetable_imports_user_id_fkey",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "user_id",
            name="timetable_imports_user_id_key",
        ),
        schema="public",
    )

    op.create_index(
        "timetable_imports_batch_id_idx",
        "timetable_imports",
        ["batch_id"],
        schema="public",
    )

    op.create_index(
        "timetable_imports_sync_status_idx",
        "timetable_imports",
        ["sync_status", "last_checked_at"],
        schema="public",
    )

    # Maps each SRUX record to its corresponding timetable entry.
    op.create_table(
        "timetable_import_entries",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("import_id", sa.Text(), nullable=False),
        sa.Column("timetable_entry_id", sa.Text(), nullable=False),
        sa.Column("source_record_id", sa.Text(), nullable=False),
        sa.Column("source_hash", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.current_timestamp(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.current_timestamp(),
        ),
        sa.ForeignKeyConstraint(
            ["import_id"],
            ["public.timetable_imports.id"],
            name="timetable_import_entries_import_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["timetable_entry_id"],
            ["public.personal_timetable_entries.id"],
            name="timetable_import_entries_timetable_entry_id_fkey",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "import_id",
            "source_record_id",
            name="timetable_import_entries_source_record_key",
        ),
        sa.UniqueConstraint(
            "timetable_entry_id",
            name="timetable_import_entries_timetable_entry_key",
        ),
        schema="public",
    )

    op.create_index(
        "timetable_import_entries_import_id_idx",
        "timetable_import_entries",
        ["import_id"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "timetable_import_entries_import_id_idx",
        table_name="timetable_import_entries",
        schema="public",
    )
    op.drop_table(
        "timetable_import_entries",
        schema="public",
    )

    op.drop_index(
        "timetable_imports_sync_status_idx",
        table_name="timetable_imports",
        schema="public",
    )
    op.drop_index(
        "timetable_imports_batch_id_idx",
        table_name="timetable_imports",
        schema="public",
    )
    op.drop_table(
        "timetable_imports",
        schema="public",
    )
