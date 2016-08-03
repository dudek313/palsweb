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
#        self.create_data_set("Data Set 2", "SingleSite")
##        self.create_data_set("Data Set 3", "SingleSite")
 #       self.create_data_set("Data Set 4", "MultipleSite")
 #       self.create_data_set("Data Set 5", "Catchment")
 #       self.create_data_set("Data Set 6", "Regional")
 #       self.create_data_set("Data Set 7", "Global")
        self.run_test()
             
    def run_test(self):
        driver = self.driver
        driver.get(self.base_url + "/")
        driver.find_element_by_link_text("Data Sets").click()
        driver.find_element_by_link_text("All Data Sets").click()
        self.assertTrue(self.is_text_present("Data Set 2"))
        self.assertTrue(self.is_text_present("Data Set 3"))
        self.assertTrue(self.is_text_present("Data Set 4"))
        self.assertTrue(self.is_text_present("Data Set 5"))
        self.assertTrue(self.is_text_present("Data Set 6"))
        self.assertTrue(self.is_text_present("Data Set 7"))
        table_rows = driver.find_elements_by_css_selector("tr")
        table_rows[1].click()
        self.assertTrue(self.is_text_present("Data Set 2"))
        driver.back()
        
        # filter SingleSite
        driver.find_element_by_xpath("/html/body/div/div[2]/div/div[1]/input[2]").click()
        self.assertTrue(self.is_text_present("SingleSite Data Sets"))
        self.assertTrue(self.is_text_present("Data Set 2"))
        self.assertTrue(self.is_text_present("Data Set 3"))
        self.assertFalse(self.is_text_present("Data Set 4"))
        self.assertFalse(self.is_text_present("Data Set 5"))
        self.assertFalse(self.is_text_present("Data Set 6"))
        self.assertFalse(self.is_text_present("Data Set 7"))
        table_rows = driver.find_elements_by_css_selector("tr")
        table_rows[2].click()
        self.assertTrue(self.is_text_present("Data Set 3"))
        driver.back()
        
        #filter MultipleSite
        driver.find_element_by_xpath("/html/body/div/div[2]/div/div[1]/input[3]").click()
        self.assertTrue(self.is_text_present("MultipleSite Data Sets"))
        self.assertFalse(self.is_text_present("Data Set 2"))
        self.assertFalse(self.is_text_present("Data Set 3"))
        self.assertTrue(self.is_text_present("Data Set 4"))
        self.assertFalse(self.is_text_present("Data Set 5"))
        self.assertFalse(self.is_text_present("Data Set 6"))
        self.assertFalse(self.is_text_present("Data Set 7"))
        table_rows = driver.find_elements_by_css_selector("tr")
        table_rows[1].click()
        self.assertTrue(self.is_text_present("Data Set 4"))
        driver.back()
        
        #filter Catchment
        driver.find_element_by_xpath("/html/body/div/div[2]/div/div[1]/input[4]").click()
        self.assertTrue(self.is_text_present("Catchment Data Sets"))
        self.assertFalse(self.is_text_present("Data Set 2"))
        self.assertFalse(self.is_text_present("Data Set 3"))
        self.assertFalse(self.is_text_present("Data Set 4"))
        self.assertTrue(self.is_text_present("Data Set 5"))
        self.assertFalse(self.is_text_present("Data Set 6"))
        self.assertFalse(self.is_text_present("Data Set 7"))
        table_rows = driver.find_elements_by_css_selector("tr")
        table_rows[1].click()
        self.assertTrue(self.is_text_present("Data Set 5"))
        driver.back()


        #filter Regional
        driver.find_element_by_xpath("/html/body/div/div[2]/div/div[1]/input[5]").click()
        self.assertTrue(self.is_text_present("Regional Data Sets"))
        self.assertFalse(self.is_text_present("Data Set 2"))
        self.assertFalse(self.is_text_present("Data Set 3"))
        self.assertFalse(self.is_text_present("Data Set 4"))
        self.assertFalse(self.is_text_present("Data Set 5"))
        self.assertTrue(self.is_text_present("Data Set 6"))
        self.assertFalse(self.is_text_present("Data Set 7"))
        table_rows = driver.find_elements_by_css_selector("tr")
        table_rows[1].click()
        self.assertTrue(self.is_text_present("Data Set 6"))
        driver.back()

        #filter Global
        driver.find_element_by_xpath("/html/body/div/div[2]/div/div[1]/input[6]").click()
        self.assertTrue(self.is_text_present("Global Data Sets"))
        self.assertFalse(self.is_text_present("Data Set 2"))
        self.assertFalse(self.is_text_present("Data Set 3"))
        self.assertFalse(self.is_text_present("Data Set 4"))
        self.assertFalse(self.is_text_present("Data Set 5"))
        self.assertFalse(self.is_text_present("Data Set 6"))
        self.assertTrue(self.is_text_present("Data Set 7"))
        table_rows = driver.find_elements_by_css_selector("tr")
        table_rows[1].click()
        self.assertTrue(self.is_text_present("Data Set 7"))
        driver.back()

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

    def create_data_set(self, data_set_name, spatial_level):
        driver = self.driver
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
        driver.find_element_by_name("name").send_keys(data_set_name)
        Select(driver.find_element_by_name("type")).select_by_visible_text("reanalysis")
        Select(driver.find_element_by_name("spatialLevel")).select_by_visible_text(spatial_level)
        Select(driver.find_element_by_name("country")).select_by_visible_text("Anguilla")
        Select(driver.find_element_by_name("vegType")).select_by_visible_text("Deciduous needleleaf")
        driver.find_element_by_name("soilType").clear()
        driver.find_element_by_name("soilType").send_keys("dirty soil")
        driver.find_element_by_name("url").clear()
        driver.find_element_by_name("url").send_keys("http://site.description.url")
        driver.find_element_by_name("lat").clear()
        driver.find_element_by_name("lat").send_keys("89")
        driver.find_element_by_name("lon").clear()
        driver.find_element_by_name("lon").send_keys("-179")
        driver.find_element_by_name("elevation").clear()
        driver.find_element_by_name("elevation").send_keys("0.01")
        driver.find_element_by_name("maxVegHeight").clear()
        driver.find_element_by_name("maxVegHeight").send_keys("1")
        driver.find_element_by_name("utcOffset").clear()
        driver.find_element_by_name("utcOffset").send_keys("12")
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

        driver.find_element_by_class_name("upload-btn").click()
        driver.find_element_by_xpath("(//input[@name='fileType'])[2]").click()
        driver.find_element_by_name("file-select").clear()
        driver.find_element_by_name("file-select").send_keys("C:\\Users\\Danny\\Downloads\\pals-nci\\webappdata\\boone\\isba_Amplero_dif_2003-2006.nc")
        time.sleep(1)
        driver.find_element_by_class_name("upload-btn").click()
        driver.find_element_by_id("downloadable").click()
        driver.find_element_by_name("file-select").clear()
        driver.find_element_by_name("file-select").send_keys("C:\\Users\\Danny\\Downloads\\pals-nci\\webappdata\\boone\\isba_Amplero_3l_2003-2006.nc")
        driver.find_element_by_xpath("//button[@type='submit']").click()
        time.sleep(2)
        self.assertTrue(self.is_text_present("Data Set: " + data_set_name))
        
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
