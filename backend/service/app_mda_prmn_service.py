"""Service for app_mda_prmn table."""

from model.app_mda_prmn import AppMdaPrmn
from service.base_service import BaseService


class AppMdaPrmnService(BaseService):
    def __init__(self):
        super().__init__(AppMdaPrmn)


prmn_service = AppMdaPrmnService()
