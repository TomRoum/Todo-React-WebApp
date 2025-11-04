import { expect } from "chai";

describe("Testing basic database functionality", () => {
  it("should get all tasks", async () => {
    const response = await fetch("http://localhost:3001/");
    const data = await response.json();
    expect(response.status).to.equal(200);
    expect(data).to.be.an("array").that.is.not.empty;
    expect(data[0]).to.include.all.keys(["id", "description"]);
  });

  it("should create a new task", async () => {
    const newTask = { description: "Test task" };
    const response = await fetch("http://localhost:3001/create", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: newTask }),
    });
    const data = await response.json();
    expect(response.status).to.equal(201);
    expect(data).to.include.all.keys(["id", "description"]);
    expect(data.description).to.equal(newTask.description);
  });

  it("should delete task", async () => {
    const response = await fetch("http://localhost:3001/delete/1", {
      method: "delete",
    });
    const data = await response.json();
    expect(response.status).to.equal(200);
    expect(data).to.include.all.keys("id");
  });

  it("should not create a new task without description", async () => {
    const response = await fetch("http://localhost:3001/create", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: null }),
    });
    const data = await response.json();
    expect(response.status).to.equal(400);
    expect(data).to.include.all.keys("error");
  });
});

describe("Testing user management", () => {
  const testEmail = `test${Date.now()}@test.com`;
  
  it("should sign up", async () => {
    const newUser = { email: testEmail, password: "password123" };
    const response = await fetch("http://localhost:3001/user/signup", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: newUser }),
    });
    const data = await response.json();
    expect(response.status).to.equal(201);
    expect(data).to.include.all.keys(["id", "email"]);
    expect(data.email).to.equal(newUser.email);
  });

  it("should not sign up with existing email", async () => {
    const existingUser = { email: testEmail, password: "password123" };
    const response = await fetch("http://localhost:3001/user/signup", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: existingUser }),
    });
    const data = await response.json();
    expect(response.status).to.equal(409);
    expect(data).to.include.all.keys("error");
  });

  it("should login with correct credentials", async () => {
    const credentials = { email: testEmail, password: "password123" };
    const response = await fetch("http://localhost:3001/user/login", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: credentials }),
    });
    const data = await response.json();
    expect(response.status).to.equal(200);
    expect(data).to.include.all.keys(["id", "email", "token"]);
    expect(data.email).to.equal(testEmail);
    expect(data.token).to.be.a("string");
  });

  it("should not login with incorrect password", async () => {
    const wrongCredentials = { email: testEmail, password: "wrongpassword" };
    const response = await fetch("http://localhost:3001/user/login", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: wrongCredentials }),
    });
    const data = await response.json();
    expect(response.status).to.equal(401);
    expect(data).to.include.all.keys("error");
  });

  it("should not login with non-existent email", async () => {
    const nonExistentUser = { email: "nonexistent@test.com", password: "password123" };
    const response = await fetch("http://localhost:3001/user/login", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: nonExistentUser }),
    });
    const data = await response.json();
    expect(response.status).to.equal(401);
    expect(data).to.include.all.keys("error");
  });
});