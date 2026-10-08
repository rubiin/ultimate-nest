import { User } from "@entities";
import { WsException } from "@nestjs/websockets";

import { SocketConnectionService } from "./socket-connection.service";

describe("socketConnectionService", () => {
  let service: SocketConnectionService;

  const alice = new User({ id: 1, username: "alice" });
  const bob = new User({ id: 2, username: "bob" });

  beforeEach(() => {
    service = new SocketConnectionService();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should start with no online users", () => {
    expect(service.getAllOnlineUSers()).toEqual([]);
  });

  it("should save a connection and expose the user", () => {
    service.saveConnection({ connectedUser: alice, socketId: "socket-1" });

    expect(service.getAllOnlineUSers()).toEqual([alice]);
    expect(service.findBySocketId("socket-1")).toBe(alice);
  });

  it("should find a user by id", () => {
    service.saveConnection({ connectedUser: alice, socketId: "socket-1" });
    service.saveConnection({ connectedUser: bob, socketId: "socket-2" });

    expect(service.findByUserId(2)).toBe(bob);
  });

  it("should overwrite the entry when the same socket reconnects", () => {
    service.saveConnection({ connectedUser: alice, socketId: "socket-1" });
    service.saveConnection({ connectedUser: bob, socketId: "socket-1" });

    expect(service.getAllOnlineUSers()).toEqual([bob]);
    expect(service.findBySocketId("socket-1")).toBe(bob);
  });

  it("should track the same user across multiple sockets", () => {
    service.saveConnection({ connectedUser: alice, socketId: "socket-1" });
    service.saveConnection({ connectedUser: alice, socketId: "socket-2" });

    expect(service.getAllOnlineUSers()).toHaveLength(2);
    expect(service.findByUserId(1)).toBe(alice);
  });

  it("should throw when the user id is unknown", () => {
    expect(() => service.findByUserId(99)).toThrow(WsException);
    expect(() => service.findByUserId(99)).toThrow("User not found");
  });

  it("should throw when the socket id is unknown", () => {
    expect(() => service.findBySocketId("missing")).toThrow(WsException);
    expect(() => service.findBySocketId("missing")).toThrow("Socket not found");
  });

  it("should delete a connection by socket id", () => {
    service.saveConnection({ connectedUser: alice, socketId: "socket-1" });

    expect(service.deleteBySocketId("socket-1")).toBe(true);
    expect(service.getAllOnlineUSers()).toEqual([]);
    expect(() => service.findBySocketId("socket-1")).toThrow(WsException);
  });

  it("should report false when deleting an unknown socket id", () => {
    expect(service.deleteBySocketId("missing")).toBe(false);
  });
});
