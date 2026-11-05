"""Add password credentials and personal timetable entries.

This is the first Alembic revision for the FastAPI backend.
It is separate from the pre-existing Prisma migration history.
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_auth_personal_timetable"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("email_verified_at", sa.DateTime(), nullable=True),
        schema="public",
    )

    op.create_table(
        "user_credentials",
        sa.Column("user_id", sa.Text(), primary_key=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
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
            ["user_id"],
            ["public.users.id"],
            name="user_credentials_user_id_fkey",
            ondelete="CASCADE",
        ),
        schema="public",
    )

    op.create_table(
        "personal_timetable_entries",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("user_id", sa.Text(), nullable=False),
        sa.Column("course_code", sa.Text(), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("weekday", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("lecturer", sa.Text(), nullable=True),
        sa.Column("room_label", sa.Text(), nullable=True),
        sa.Column("place_id", sa.Text(), nullable=True),
        sa.Column("course_section_id", sa.Text(), nullable=True),
        sa.Column(
            "source",
            sa.Text(),
            nullable=False,
            server_default="manual",
        ),
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
            "weekday BETWEEN 1 AND 7",
            name="personal_timetable_entries_weekday_check",
        ),
        sa.CheckConstraint(
            "start_time < end_time",
            name="personal_timetable_entries_time_check",
        ),
        sa.CheckConstraint(
            "source IN ('manual', 'upload', 'official')",
            name="personal_timetable_entries_source_check",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["public.users.id"],
            name="personal_timetable_entries_user_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["place_id"],
            ["public.places.id"],
            name="personal_timetable_entries_place_id_fkey",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["course_section_id"],
            ["public.course_sections.id"],
            name="personal_timetable_entries_course_section_id_fkey",
            ondelete="SET NULL",
        ),
        schema="public",
    )

    op.create_index(
        "personal_timetable_entries_user_weekday_idx",
        "personal_timetable_entries",
        ["user_id", "weekday", "start_time"],
        schema="public",
    )

    op.create_index(
        "personal_timetable_entries_course_section_idx",
        "personal_timetable_entries",
        ["course_section_id"],
        schema="public",
        postgresql_where=sa.text("course_section_id IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index(
        "personal_timetable_entries_course_section_idx",
        table_name="personal_timetable_entries",
        schema="public",
    )
    op.drop_index(
        "personal_timetable_entries_user_weekday_idx",
        table_name="personal_timetable_entries",
        schema="public",
    )
    op.drop_table("personal_timetable_entries", schema="public")
    op.drop_table("user_credentials", schema="public")
    op.drop_column("users", "email_verified_at", schema="public")
