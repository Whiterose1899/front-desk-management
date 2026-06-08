import sqlalchemy as sa
from app.database import Base

class Test(Base):
    __tablename__ = "test"

    id = sa.Column(
        sa.Integer, 
        primary_key=True,
        nullable=False
    )
    name = sa.Column(
        sa.String,
        nullable=False
    )
    description = sa.Column(
        sa.String(200),
        nullable=False
    )
    client = sa.Column(
        sa.String(150), 
        nullable=False
    )
    def __repr__(self):
        return f"Test(id={self.id}, name={self.name}, description={self.description})"