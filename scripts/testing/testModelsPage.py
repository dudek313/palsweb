# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class ModelsPage(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://192.168.56.100:3000/"
        self.verificationErrors = []
        self.accept_next_alert = True
 
# Unfinished. Needs a lot of changes...       
    def test_models_page(self):
        self.valid_login()
        self.create_model("Model 1")
        self.create_model("Model 2")
        self.create_model("Model 3")
        self.create_model("Model 4")
        self.create_model("Model 5")
        self.create_model("Model 6")
        self.run_test()
             
    def run_test(self):
        driver = self.driver
        driver.get(self.base_url + "/")
        driver.find_element_by_link_text("Model Profiles").click()
        driver.find_element_by_link_text("Owned By Me").click()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("Model 1"))
        self.assertTrue(self.is_text_present("Model 2"))
        self.assertTrue(self.is_text_present("Model 3"))
        self.assertTrue(self.is_text_present("Model 4"))
        self.assertTrue(self.is_text_present("Model 5"))
        self.assertTrue(self.is_text_present("Model 6"))

        table_rows = driver.find_elements_by_css_selector("tr")
        table_rows[2].click()
        self.assertTrue(self.is_text_present("Model Profile: Model 2"))
        driver.back()
                
        #delete a model profile
        driver.find_element_by_class_name("delete").click()
        alert = driver.switch_to.alert
        alert.dismiss()
        time.sleep(0.5)
        table_rows = driver.find_elements_by_css_selector("tr")
        self.assertTrue(len(table_rows) == 7)
        self.assertTrue(self.is_text_present("Model 1"))
        driver.find_element_by_class_name("delete").click()
        alert = driver.switch_to.alert
        alert.accept()
        time.sleep(0.5)
        self.assertFalse(self.is_text_present("Model 1"))
        table_rows = driver.find_elements_by_css_selector("tr")
        self.assertTrue(len(table_rows) == 6)


    def valid_login(self):
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

    def create_model(self, model_name):
        driver = self.driver
        driver.find_element_by_link_text("Model Profiles").click()
        driver.find_element_by_link_text("Create Model Profile").click()
        driver.find_element_by_name("name").clear()
        driver.find_element_by_name("name").send_keys(model_name)
        driver.find_element_by_name("url").clear()
        driver.find_element_by_name("url").send_keys("http://whatever.is.good")
        driver.find_element_by_name("references").clear()
        driver.find_element_by_name("references").send_keys("refsfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ Q Q qQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ\nQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ\n\n\n\nn\n\n\n\n\n\n\n\n\n\n\n\\asdfsdfasdfasdfasdfasdf")
        driver.find_element_by_name("comments").clear()
        driver.find_element_by_name("comments").send_keys("comments")
        driver.find_element_by_xpath("//button[@type='submit']").click()
        self.assertEqual("Model Profile: " + model_name, driver.find_element_by_css_selector("h1").text)
        
    def is_text_present(self, text):
        return str(text) in self.driver.page_source

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
