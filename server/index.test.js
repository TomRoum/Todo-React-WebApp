import { expect } from "chai";
import { initializeTestDb, insertTestUser, getToken } from "./helper/test.js";
import { logger } from "./helper/logger.js";

const testEmail = "test@example.com";
const API_URL = "http://localhost:3001";

describe("Testing basic database functionality", () => {
  let token = null;
  const testUser = { email: "foo@foo.com", password: "password123" };

  before(async () => {
    logger.info("=== SETUP: Initializing test database ===");
    try {
      await initializeTestDb();
      token = getToken(testUser.email);
      logger.info("Database initialization successful");
    } catch (error) {
      logger.error("Database initialization failed", error);
      throw error;
    }
  });

  afterEach(async () => {
    logger.info("--- Resetting database after test ---");
    try {
      await initializeTestDb();
    } catch (error) {
      logger.error("Database reset failed", error);
    }
  });

  after(() => {
    logger.endSession();
  });

  it("should get all tasks", async () => {
    const testName = "GET all tasks";
    logger.testStart(testName);

    try {
      logger.httpRequest("GET", `${API_URL}/`);
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(200);
      expect(data).to.be.an("array").that.is.not.empty;
      expect(data[0]).to.include.all.keys(["id", "description"]);

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should create a new task with valid token", async () => {
    const testName = "POST create new task with auth";
    logger.testStart(testName);

    try {
      const newTask = { description: "Test task" };
      logger.httpRequest("POST", `${API_URL}/create`, {
        task: newTask,
      });

      const response = await fetch(`${API_URL}/create`, {
        method: "post",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ task: newTask }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(201);
      expect(data).to.include.all.keys(["id", "description"]);
      expect(data.description).to.equal(newTask.description);

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should NOT create a task without authentication token", async () => {
    const testName = "POST create task without token (should fail with 401)";
    logger.testStart(testName);

    try {
      const newTask = { description: "Unauthorized task" };
      logger.httpRequest("POST", `${API_URL}/create`, {
        task: newTask,
      });

      const response = await fetch(`${API_URL}/create`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(401);

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should NOT create a task with invalid token", async () => {
    const testName = "POST create task with invalid token (should fail with 401)";
    logger.testStart(testName);

    try {
      const newTask = { description: "Task with invalid token" };
      const invalidToken = "invalid.token.here";
      
      logger.httpRequest("POST", `${API_URL}/create`, {
        task: newTask,
      });

      const response = await fetch(`${API_URL}/create`, {
        method: "post",
        headers: { 
          "Content-Type": "application/json",
          Authorization: invalidToken
        },
        body: JSON.stringify({ task: newTask }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(401);

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should delete task", async () => {
    const testName = "DELETE task";
    logger.testStart(testName);

    try {
      const newTask = { description: "Task to be deleted" };
      logger.httpRequest("POST", `${API_URL}/create`, {
        task: newTask,
      });

      const createResponse = await fetch(`${API_URL}/create`, {
        method: "post",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ task: newTask }),
      });
      const createdTask = await createResponse.json();
      logger.httpResponse(createResponse.status, createdTask);

      logger.httpRequest(
        "DELETE",
        `${API_URL}/delete/${createdTask.id}`
      );
      const deleteResponse = await fetch(
        `${API_URL}/delete/${createdTask.id}`,
        {
          method: "delete",
        }
      );
      const data = await deleteResponse.json();

      logger.httpResponse(deleteResponse.status, data);

      expect(deleteResponse.status).to.equal(200);
      expect(data).to.include.all.keys("id");
      expect(data.id).to.equal(createdTask.id);

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should not create a new task without description", async () => {
    const testName = "POST create task without description (should fail)";
    logger.testStart(testName);

    try {
      logger.httpRequest("POST", `${API_URL}/create`, {
        task: null,
      });

      const response = await fetch(`${API_URL}/create`, {
        method: "post",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ task: null }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(400);
      expect(data).to.include.all.keys("error");

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should return 404 when deleting non-existent task", async () => {
    const testName = "DELETE non-existent task (should return 404)";
    logger.testStart(testName);

    try {
      logger.httpRequest("DELETE", `${API_URL}/delete/99999`);

      const response = await fetch(`${API_URL}/delete/99999`, {
        method: "delete",
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(404);
      expect(data.error.message).to.equal("Task not found");

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });
});

describe("Testing user management", () => {
  const user = { email: "foo2@test.com", password: "password123" };

  before(async () => {
    await initializeTestDb();
    await insertTestUser(user);
  });

  it("should sign up", async () => {
    const testName = "POST signup new user";
    logger.testStart(testName);

    try {
      const newUser = { email: testEmail, password: "password123" };
      logger.httpRequest("POST", `${API_URL}/user/signup`, {
        user: { email: testEmail, password: "***" },
      });

      const response = await fetch(`${API_URL}/user/signup`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: newUser }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(201);
      expect(data).to.include.all.keys(["id", "email"]);
      expect(data.email).to.equal(newUser.email);

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should not sign up with existing email", async () => {
    const testName = "POST signup with existing email (should fail)";
    logger.testStart(testName);

    try {
      const existingUser = { email: testEmail, password: "password123" };
      logger.httpRequest("POST", `${API_URL}/user/signup`, {
        user: { email: testEmail, password: "***" },
      });

      const response = await fetch(`${API_URL}/user/signup`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: existingUser }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(409);
      expect(data).to.include.all.keys("error");

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should log in with signin endpoint", async () => {
    const testName = "POST signin with correct credentials";
    logger.testStart(testName);

    try {
      logger.httpRequest("POST", `${API_URL}/user/signin`, {
        user: { email: user.email, password: "***" },
      });

      const response = await fetch(`${API_URL}/user/signin`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(200);
      expect(data).to.include.all.keys(["id", "email", "token"]);
      expect(data.email).to.equal(user.email);

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should login with correct credentials", async () => {
    const testName = "POST login with correct credentials";
    logger.testStart(testName);

    try {
      const credentials = { email: testEmail, password: "password123" };
      logger.httpRequest("POST", `${API_URL}/user/login`, {
        user: { email: testEmail, password: "***" },
      });

      const response = await fetch(`${API_URL}/user/login`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: credentials }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, {
        ...data,
        token: data.token ? "***TOKEN***" : undefined,
      });

      expect(response.status).to.equal(200);
      expect(data).to.include.all.keys(["id", "email", "token"]);
      expect(data.email).to.equal(testEmail);
      expect(data.token).to.be.a("string");

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should not login with incorrect password", async () => {
    const testName = "POST login with incorrect password (should fail)";
    logger.testStart(testName);

    try {
      const wrongCredentials = { email: testEmail, password: "wrongpassword" };
      logger.httpRequest("POST", `${API_URL}/user/login`, {
        user: { email: testEmail, password: "***" },
      });

      const response = await fetch(`${API_URL}/user/login`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: wrongCredentials }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(401);
      expect(data).to.include.all.keys("error");

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should not login with non-existent email", async () => {
    const testName = "POST login with non-existent email (should fail)";
    logger.testStart(testName);

    try {
      const nonExistentUser = {
        email: "nonexistent@test.com",
        password: "password123",
      };
      logger.httpRequest("POST", `${API_URL}/user/login`, {
        user: { email: "nonexistent@test.com", password: "***" },
      });

      const response = await fetch(`${API_URL}/user/login`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: nonExistentUser }),
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(401);
      expect(data).to.include.all.keys("error");

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });

  it("should logout successfully", async () => {
    const testName = "POST logout";
    logger.testStart(testName);

    try {
      const token = getToken(testEmail);
      logger.httpRequest("POST", `${API_URL}/user/logout`);

      const response = await fetch(`${API_URL}/user/logout`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      const data = await response.json();

      logger.httpResponse(response.status, data);

      expect(response.status).to.equal(200);
      expect(data).to.include.all.keys("message");

      logger.testPass(testName);
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });
});

describe("Testing complete user flow", () => {
  let userToken = null;
  let taskId = null;
  const flowUser = { 
    email: `flow-${Date.now()}@test.com`, 
    password: "testpass123" 
  };

  before(async () => {
    await initializeTestDb();
  });

  it("FULL FLOW: should signup -> signin -> create task -> delete task -> logout", async () => {
    const testName = "Complete User Flow";
    logger.testStart(testName);

    try {
      // Step 1: Signup
      logger.info("Step 1: Signing up new user");
      const signupResponse = await fetch(`${API_URL}/user/signup`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: flowUser }),
      });
      const signupData = await signupResponse.json();
      expect(signupResponse.status).to.equal(201);
      logger.info("✓ Signup successful");

      // Step 2: Signin
      logger.info("Step 2: Signing in");
      const signinResponse = await fetch(`${API_URL}/user/signin`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: flowUser }),
      });
      const signinData = await signinResponse.json();
      expect(signinResponse.status).to.equal(200);
      expect(signinData).to.have.property("token");
      userToken = signinData.token;
      logger.info("✓ Signin successful, token received");

      // Step 3: Create task
      logger.info("Step 3: Creating a task");
      const createTaskResponse = await fetch(`${API_URL}/create`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: userToken,
        },
        body: JSON.stringify({ task: { description: "Test flow task" } }),
      });
      const taskData = await createTaskResponse.json();
      expect(createTaskResponse.status).to.equal(201);
      expect(taskData).to.have.property("id");
      taskId = taskData.id;
      logger.info("✓ Task created successfully");

      // Step 4: Verify task exists
      logger.info("Step 4: Verifying task exists");
      const getTasksResponse = await fetch(`${API_URL}/`);
      const tasks = await getTasksResponse.json();
      const foundTask = tasks.find((t) => t.id === taskId);
      expect(foundTask).to.exist;
      expect(foundTask.description).to.equal("Test flow task");
      logger.info("✓ Task verified in database");

      // Step 5: Delete task
      logger.info("Step 5: Deleting task");
      const deleteResponse = await fetch(`${API_URL}/delete/${taskId}`, {
        method: "delete",
      });
      const deleteData = await deleteResponse.json();
      expect(deleteResponse.status).to.equal(200);
      expect(deleteData.id).to.equal(taskId);
      logger.info("✓ Task deleted successfully");

      // Step 6: Logout
      logger.info("Step 6: Logging out");
      const logoutResponse = await fetch(`${API_URL}/user/logout`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: userToken,
        },
      });
      expect(logoutResponse.status).to.equal(200);
      logger.info("✓ Logout successful");

      logger.testPass(testName);
      logger.info("🎉 Complete flow test passed!");
    } catch (error) {
      logger.testFail(testName, error);
      throw error;
    }
  });
});