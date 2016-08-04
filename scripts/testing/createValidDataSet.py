# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class CreateValidDataSet(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://192.168.56.100:3000/"
        self.verificationErrors = []
        self.accept_next_alert = True

    def test_create_valid_data_set(self):
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
        driver.get(self.base_url + "/dataset/create")
        driver.find_element_by_link_text("Data Sets").click()
        for i in range(60):
            try:
                if self.is_element_present(By.LINK_TEXT, "Create Data Set"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        driver.find_element_by_link_text("Create Data Set").click()
        driver.find_element_by_name("name").clear()
        driver.find_element_by_name("name").send_keys("Data set 1")
        Select(driver.find_element_by_name("type")).select_by_visible_text("reanalysis")
        Select(driver.find_element_by_name("spatialLevel")).select_by_visible_text("SingleSite")
        Select(driver.find_element_by_name("country")).select_by_visible_text("Anguilla")
        Select(driver.find_element_by_name("vegType")).select_by_visible_text("Deciduous needleleaf")
        driver.find_element_by_name("soilType").clear()
        driver.find_element_by_name("soilType").send_keys("dirty soil")
        driver.find_element_by_name("url").clear()
        driver.find_element_by_name("url").send_keys("no good")
        driver.find_element_by_name("lat").clear()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("Site Description URL must be a valid URL"))

        driver.find_element_by_name("url").clear()
        driver.find_element_by_name("url").send_keys("http://site.description.url")
        driver.find_element_by_name("lat").clear()
        time.sleep(0.5)
        self.assertFalse(self.is_text_present("Site Description URL must be a valid URL"))

        driver.find_element_by_name("lat").clear()
        driver.find_element_by_name("lat").send_keys("-91")
        driver.find_element_by_name("lon").clear()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("Latitude (decimal) must be at least -90"))

        driver.find_element_by_name("lat").clear()
        driver.find_element_by_name("lat").send_keys("91")
        driver.find_element_by_name("lon").clear()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("Latitude (decimal) cannot exceed 90"))

        driver.find_element_by_name("lat").clear()
        driver.find_element_by_name("lat").send_keys("89")
        driver.find_element_by_name("lon").clear()
        time.sleep(0.5)
        self.assertFalse(self.is_text_present("Latitude (decimal) must be at least -90"))
        self.assertFalse(self.is_text_present("Latitude (decimal) cannot exceed 90"))

        driver.find_element_by_name("lon").clear()
        driver.find_element_by_name("lon").send_keys("181")
        driver.find_element_by_name("elevation").clear()
        driver.find_element_by_xpath("//form[@id='createDatasetForm']/fieldset/div[3]/div[2]/button").click()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("Longitude (decimal) cannot exceed 180"))

        driver.find_element_by_name("lon").clear()
        driver.find_element_by_name("lon").send_keys("-181")
        driver.find_element_by_name("elevation").clear()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("Longitude (decimal) must be at least -180"))

        driver.find_element_by_name("lon").clear()
        driver.find_element_by_name("lon").send_keys("-179")
        driver.find_element_by_name("elevation").clear()
        time.sleep(0.5)
        self.assertFalse(self.is_text_present("Longitude (decimal) must be at least -180"))
        self.assertFalse(self.is_text_present("Longitude (decimal) cannot exceed 180"))

        driver.find_element_by_name("elevation").clear()
        driver.find_element_by_name("elevation").send_keys("-5")
        driver.find_element_by_name("maxVegHeight").clear()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("Elevation (m) must be at least 0"))

        driver.find_element_by_name("elevation").clear()
        driver.find_element_by_name("elevation").send_keys("0.01")
        driver.find_element_by_name("maxVegHeight").clear()
        time.sleep(0.5)
        self.assertFalse(self.is_text_present("Elevation (m) must be at least 0"))

        driver.find_element_by_name("maxVegHeight").clear()
        driver.find_element_by_name("maxVegHeight").send_keys("-5")
        driver.find_element_by_name("utcOffset").clear()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("Max Vegetation Height (m) must be at least 0"))

        driver.find_element_by_name("maxVegHeight").clear()
        driver.find_element_by_name("maxVegHeight").send_keys("1")
        driver.find_element_by_name("utcOffset").clear()
        time.sleep(0.5)
        self.assertFalse(self.is_text_present("Max Vegetation Height (m) must be at least 0"))

        driver.find_element_by_name("utcOffset").clear()
        driver.find_element_by_name("utcOffset").send_keys("12.5")
        driver.find_element_by_name("siteContact").clear()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("UTC Offset (hours) cannot exceed 12"))

        driver.find_element_by_name("utcOffset").clear()
        driver.find_element_by_name("utcOffset").send_keys("-12.5")
        driver.find_element_by_name("siteContact").clear()
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("UTC Offset (hours) must be at least -12"))

        driver.find_element_by_name("utcOffset").clear()
        driver.find_element_by_name("utcOffset").send_keys("12")
        driver.find_element_by_name("siteContact").clear()
        time.sleep(0.5)
        self.assertFalse(self.is_text_present("UTC Offset (hours) must be at least -12"))
        self.assertFalse(self.is_text_present("UTC Offset (hours) cannot exceed 12"))

        driver.find_element_by_name("siteContact").clear()
        driver.find_element_by_name("siteContact").send_keys("787")
        driver.find_element_by_name("references").clear()
        driver.find_element_by_name("references").send_keys("Any reference")
        driver.find_element_by_name("comments").clear()
        driver.find_element_by_name("comments").send_keys("come on\n\ncome one")
        driver.find_element_by_name("region").clear()
        driver.find_element_by_name("variables.NEE").click()
        driver.find_element_by_name("variables.Qh").click()
        driver.find_element_by_name("variables.Rnet").click()
        driver.find_element_by_name("region").clear()
        driver.find_element_by_name("region").send_keys("the best")
        Select(driver.find_element_by_name("resolution")).select_by_visible_text("2 deg")

        driver.find_element_by_xpath("//form[@id='createDatasetForm']/fieldset/div[3]/div[2]/button").is_enabled()
        driver.find_element_by_xpath("//form[@id='createDatasetForm']/fieldset/div[3]/div[2]/button").click()

        driver.find_element_by_id("downloadable").click()
        driver.find_element_by_name("file-select").clear()
        driver.find_element_by_name("file-select").send_keys("C:\\Users\\Danny\\Downloads\\pals-nci\\webappdata\\boone\\isba_ElSaler2_dif_2005-2006.nc")
        time.sleep(0.5)
        self.assertTrue(self.is_text_present("isba_ElSaler2_dif_2005-2006.nc"))

        driver.find_element_by_class_name("delete-file btn btn-danger btn-xs").click()
        time.sleep(0.5)
        self.assertFalse(self.is_text_present("isba_ElSaler2_dif_2005-2006.nc"))

        driver.find_element_by_xpath("//form[@id='createDatasetForm']/fieldset/div[3]/div[2]/button").click()
        driver.find_element_by_xpath("(//input[@name='fileType'])[2]").click()
        driver.find_element_by_name("file-select").clear()
        driver.find_element_by_name("file-select").send_keys("C:\\Users\\Danny\\Downloads\\pals-nci\\webappdata\\boone\\isba_Amplero_dif_2003-2006.nc")
        driver.find_element_by_xpath("//form[@id='createDatasetForm']/fieldset/div[3]/div[2]/button").click()
        driver.find_element_by_id("downloadable").click()
        driver.find_element_by_name("file-select").clear()
        driver.find_element_by_name("file-select").send_keys("C:\\Users\\Danny\\Downloads\\pals-nci\\webappdata\\boone\\isba_Amplero_3l_2003-2006.nc")
        driver.find_element_by_xpath("//button[@type='submit']").click()
        self.assertFalse(self.is_element_present(By.XPATH, "//form[@id='createDatasetForm']/fieldset/div"))

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
