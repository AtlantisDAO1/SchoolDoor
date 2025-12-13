"""Add participant users table and update reviews

Revision ID: def789abc123
Revises: 72f70a0c5ff3
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'def789abc123'
down_revision: Union[str, None] = '72f70a0c5ff3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create participant_users table
    op.create_table(
        'participant_users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_participant_users_email'), 'participant_users', ['email'], unique=True)
    op.create_index(op.f('ix_participant_users_id'), 'participant_users', ['id'], unique=False)
    
    # Add participant_id column to reviews table (using try/except for idempotency)
    try:
        op.add_column('reviews', sa.Column('participant_id', sa.Integer(), nullable=True))
    except Exception:
        pass  # Column might already exist
    
    try:
        op.create_index(op.f('ix_reviews_participant_id'), 'reviews', ['participant_id'], unique=False)
    except Exception:
        pass  # Index might already exist
    
    # Create foreign key
    try:
        op.create_foreign_key('fk_reviews_participant_id', 'reviews', 'participant_users', ['participant_id'], ['id'])
    except Exception:
        pass  # Foreign key might already exist
    
    # Add status column to reviews table
    try:
        op.add_column('reviews', sa.Column('status', sa.String(length=50), nullable=True, server_default='pending'))
    except Exception:
        pass  # Column might already exist
    
    try:
        op.create_index(op.f('ix_reviews_status'), 'reviews', ['status'], unique=False)
    except Exception:
        pass  # Index might already exist


def downgrade() -> None:
    # Remove indexes and foreign keys first
    try:
        op.drop_index(op.f('ix_reviews_status'), table_name='reviews')
        op.drop_column('reviews', 'status')
    except Exception:
        pass
    
    try:
        op.drop_constraint('fk_reviews_participant_id', 'reviews', type_='foreignkey')
        op.drop_index(op.f('ix_reviews_participant_id'), table_name='reviews')
        op.drop_column('reviews', 'participant_id')
    except Exception:
        pass
    
    # Drop participant_users table
    op.drop_index(op.f('ix_participant_users_id'), table_name='participant_users')
    op.drop_index(op.f('ix_participant_users_email'), table_name='participant_users')
    op.drop_table('participant_users')

