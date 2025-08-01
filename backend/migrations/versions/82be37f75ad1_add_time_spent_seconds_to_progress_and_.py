"""Add time_spent_seconds to progress and submission, update question fields

Revision ID: 82be37f75ad1
Revises: b355c991e196
Create Date: 2025-07-16 03:53:30.655542

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '82be37f75ad1'
down_revision = 'b355c991e196'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('submissions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('time_spent_seconds', sa.Integer(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('submissions', schema=None) as batch_op:
        batch_op.drop_column('time_spent_seconds')

    # ### end Alembic commands ###
