import { LoginPage } from '../../page-objects/LoginPage';
import { credentials, locationName } from '../../fixtures/testData';

describe('Authentication - Optimized Architecture', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    loginPage.goto();
  });

  it('should login successfully with valid credentials', () => {
    loginPage.login(
      credentials.admin.username,
      credentials.admin.password,
      locationName
    );
    // Automatically dynamic: waits for the UI to transition successfully
    loginPage.assertLoggedIn();
  });

  it('should show error with wrong password', () => {
    loginPage.loginWithInvalidCredentials(
      credentials.admin.username,
      'wrongpassword'
    );
    loginPage.assertErrorVisible('Invalid username/password');
  });

  it('should show error with wrong username', () => {
    loginPage.loginWithInvalidCredentials(
      'unknownuser',
      credentials.admin.password
    );
    loginPage.assertErrorVisible('Invalid username/password');
  });

  it('should not login with blank credentials', () => {
    loginPage.loginWithInvalidCredentials('', '');
    loginPage.assertOnLoginPage();
  });
});