"""Add school_requests table

Revision ID: jkl012mno345
Revises: ghi789jkl456
Create Date: 2025-11-02 23:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'jkl012mno345'
down_revision: Union[str, None] = 'ghi789jkl456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create school_requests table
    op.create_table(
        'school_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('zip_code', sa.String(length=20), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('school_type', sa.String(length=50), nullable=True),
        sa.Column('board', sa.String(length=50), nullable=True),
        sa.Column('grade_levels', sa.String(length=100), nullable=True),
        sa.Column('enrollment', sa.Integer(), nullable=True),
        sa.Column('student_teacher_ratio', sa.Float(), nullable=True),
        sa.Column('medium_of_instruction', sa.String(length=50), nullable=True),
        sa.Column('principal_name', sa.String(length=255), nullable=True),
        sa.Column('established_year', sa.Integer(), nullable=True),
        sa.Column('board_exam_results', sa.JSON(), nullable=True),
        sa.Column('competitive_exam_results', sa.JSON(), nullable=True),
        sa.Column('programs', sa.JSON(), nullable=True),
        sa.Column('facilities', sa.JSON(), nullable=True),
        sa.Column('member_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('reviewed_by', sa.Integer(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['member_id'], ['member_users.id'], ),
        sa.ForeignKeyConstraint(['reviewed_by'], ['admin_users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_school_requests_id'), 'school_requests', ['id'], unique=False)
    op.create_index(op.f('ix_school_requests_member_id'), 'school_requests', ['member_id'], unique=False)
    op.create_index(op.f('ix_school_requests_status'), 'school_requests', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_school_requests_status'), table_name='school_requests')
    op.drop_index(op.f('ix_school_requests_member_id'), table_name='school_requests')
    op.drop_index(op.f('ix_school_requests_id'), table_name='school_requests')
    op.drop_table('school_requests')


