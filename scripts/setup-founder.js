"use strict";
// =============================================================================
// FOUNDER SETUP SCRIPT - RUN ONCE TO CREATE INITIAL ADMIN
// =============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function setupFounder() {
    return __awaiter(this, void 0, void 0, function () {
        var FOUNDER_CLERK_ID, FOUNDER_EMAIL, existingUser, founder, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 7]);
                    console.log("🚀 Setting up founder admin access...");
                    FOUNDER_CLERK_ID = "user_35jot94FIsXLkQ9NWc5QBWre8oS";
                    FOUNDER_EMAIL = "ashujha009322@gmail.com";
                    return [4 /*yield*/, prisma.athlete.findUnique({
                            where: { clerkUserId: FOUNDER_CLERK_ID },
                        })];
                case 1:
                    existingUser = _a.sent();
                    if (existingUser && existingUser.isAdmin) {
                        console.log("✅ User is already an admin!");
                        console.log("👤 Admin:", existingUser.firstName, existingUser.lastName);
                        console.log("📧 Email:", existingUser.email);
                        console.log("🔐 Role:", existingUser.adminRole);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, prisma.athlete.upsert({
                            where: { clerkUserId: FOUNDER_CLERK_ID },
                            update: {
                                roles: { set: ["ADMIN"] }, // Add ADMIN to existing roles
                                isAdmin: true,
                                adminRole: "FOUNDER",
                                adminGrantedAt: new Date(),
                                updatedAt: new Date(),
                            },
                            create: {
                                clerkUserId: FOUNDER_CLERK_ID,
                                email: FOUNDER_EMAIL,
                                roles: ["ADMIN"],
                                isAdmin: true,
                                adminRole: "FOUNDER",
                                adminGrantedAt: new Date(),
                            },
                        })];
                case 2:
                    founder = _a.sent();
                    // Log the admin action
                    return [4 /*yield*/, prisma.adminAction.create({
                            data: {
                                adminUserId: founder.id,
                                action: "FOUNDER_SETUP",
                                details: {
                                    note: "Initial founder setup via script",
                                    timestamp: new Date().toISOString(),
                                    email: FOUNDER_EMAIL,
                                },
                            },
                        })];
                case 3:
                    // Log the admin action
                    _a.sent();
                    console.log("✅ Founder setup complete!");
                    console.log("👤 Founder ID:", founder.id);
                    console.log("📧 Email:", founder.email);
                    console.log("🔐 Admin Role:", founder.adminRole);
                    console.log("📅 Granted At:", founder.adminGrantedAt);
                    console.log("");
                    console.log("🎉 You can now access admin features!");
                    console.log("🔗 Admin Panel: http://localhost:3000/admin/moderators");
                    return [3 /*break*/, 7];
                case 4:
                    error_1 = _a.sent();
                    console.error("❌ Founder setup failed:", error_1);
                    if (error_1 instanceof Error) {
                        if (error_1.message.includes("Unique constraint")) {
                            console.log("💡 Tip: The email might already be used by another user");
                        }
                        if (error_1.message.includes("Foreign key constraint")) {
                            console.log("💡 Tip: Make sure the Clerk User ID is correct");
                        }
                    }
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, prisma.$disconnect()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
setupFounder();
