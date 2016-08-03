# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class LoginAndLogout(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://192.168.56.100:3000/"
        self.verificationErrors = []
        self.accept_next_alert = True

    def test_login_and_logout(self):
        driver = self.driver
        driver.get(self.base_url + "/")
        for i in range(60):
            try:
                if self.is_element_present(By.ID, "login-sign-in-link"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        driver.find_element_by_id("login-sign-in-link").click()
        driver.find_element_by_id("login-email").clear()
        driver.find_element_by_id("login-email").send_keys("gabsun@gmail.com")
        driver.find_element_by_id("login-password").clear()
        driver.find_element_by_id("login-password").send_keys("password")
        driver.find_element_by_id("login-buttons-password").click()
        for i in range(60):
            try:
                if self.is_element_present(By.ID, "login-name-link"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        self.assertTrue(self.is_element_present(By.LINK_TEXT, u"gab ▾"))
        for i in range(60):
            try:
                if self.is_element_present(By.ID, "login-name-link"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        driver.find_element_by_id("login-name-link").click()
        driver.find_element_by_id("login-buttons-logout").click()
        # Warning: assertTextPresent may require manual changes
        self.assertRegex(driver.find_element_by_css_selector("BODY").text, r"^[\s\S]*$")

    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException as e: return False
        return True

    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException as e: return False
        return True

    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True

    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
