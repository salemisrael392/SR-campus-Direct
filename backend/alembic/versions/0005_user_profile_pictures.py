"""Add profile picture URL to users."""

from alembic import op
import sqlalchemy as sa


revision = "0005_user_profile_pictures"
down_revision = "0004_srux_timetable_imports"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("profile_picture_url", sa.Text(), nullable=True),
        schema="public",
    )


def downgrade() -> None:
    op.drop_column(
        "users",
        "profile_picture_url",
        schema="public",
    )
