"""Service for app_mda_user table."""

from model.app_mda_user import AppMdaUser
from service.base_service import BaseService


class AppMdaUserService(BaseService):
    def __init__(self):
        super().__init__(AppMdaUser)


user_service = AppMdaUserService()
