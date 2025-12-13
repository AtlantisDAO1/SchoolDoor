"""Rename participant_users table to member_users

Revision ID: ghi789jkl456
Revises: def789abc123
Create Date: 2025-01-20 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ghi789jkl456'
down_revision: Union[str, None] = 'def789abc123'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename participant_users table to member_users
    # First, drop the foreign key constraint if it exists
    try:
        op.drop_constraint('fk_reviews_participant_id', 'reviews', type_='foreignkey')
    except Exception:
        pass  # Foreign key might not exist
    
    # Drop indexes on participant_users table
    try:
        op.drop_index(op.f('ix_participant_users_id'), table_name='participant_users')
        op.drop_index(op.f('ix_participant_users_email'), table_name='participant_users')
    except Exception:
        pass  # Indexes might not exist
    
    # Rename the table
    try:
        op.rename_table('participant_users', 'member_users')
    except Exception as e:
        # Table might already be renamed or might not exist
        print(f"Table rename warning: {e}")
    
    # Recreate indexes with new table name
    try:
        op.create_index(op.f('ix_member_users_id'), 'member_users', ['id'], unique=False)
        op.create_index(op.f('ix_member_users_email'), 'member_users', ['email'], unique=True)
    except Exception:
        pass  # Indexes might already exist
    
    # Recreate foreign key with new table name
    try:
        op.create_foreign_key(
            'fk_reviews_participant_id', 
            'reviews', 
            'member_users', 
            ['participant_id'], 
            ['id']
        )
    except Exception:
        pass  # Foreign key might already exist
    
    # Add member_id column if it doesn't exist (for future use)
    # We keep participant_id for backward compatibility
    try:
        op.add_column('reviews', sa.Column('member_id', sa.Integer(), nullable=True))
    except Exception:
        pass  # Column might already exist
    
    # Copy data from participant_id to member_id
    try:
        op.execute("""
            UPDATE reviews 
            SET member_id = participant_id 
            WHERE participant_id IS NOT NULL AND member_id IS NULL
        """)
    except Exception:
        pass  # Data might already be copied
    
    # Create index and foreign key for member_id
    try:
        op.create_index(op.f('ix_reviews_member_id'), 'reviews', ['member_id'], unique=False)
    except Exception:
        pass  # Index might already exist
    
    try:
        op.create_foreign_key(
            'fk_reviews_member_id',
            'reviews',
            'member_users',
            ['member_id'],
            ['id']
        )
    except Exception:
        pass  # Foreign key might already exist


def downgrade() -> None:
    # Remove member_id column if it exists
    try:
        op.drop_constraint('fk_reviews_member_id', 'reviews', type_='foreignkey')
        op.drop_index(op.f('ix_reviews_member_id'), table_name='reviews')
        op.drop_column('reviews', 'member_id')
    except Exception:
        pass
    
    # Drop foreign key constraint
    try:
        op.drop_constraint('fk_reviews_participant_id', 'reviews', type_='foreignkey')
    except Exception:
        pass
    
    # Drop indexes
    try:
        op.drop_index(op.f('ix_member_users_id'), table_name='member_users')
        op.drop_index(op.f('ix_member_users_email'), table_name='member_users')
    except Exception:
        pass
    
    # Rename table back to participant_users
    try:
        op.rename_table('member_users', 'participant_users')
    except Exception:
        pass
    
    # Recreate indexes
    try:
        op.create_index(op.f('ix_participant_users_id'), 'participant_users', ['id'], unique=False)
        op.create_index(op.f('ix_participant_users_email'), 'participant_users', ['email'], unique=True)
    except Exception:
        pass
    
    # Recreate foreign key
    try:
        op.create_foreign_key(
            'fk_reviews_participant_id',
            'reviews',
            'participant_users',
            ['participant_id'],
            ['id']
        )
    except Exception:
        pass

