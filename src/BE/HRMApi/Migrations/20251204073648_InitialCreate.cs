using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRMApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    employee_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    employee_code = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    full_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    date_of_birth = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    gender = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    phone_number = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    personal_email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    company_email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    current_address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    citizen_id = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    personal_tax_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    social_insurance_no = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    marital_status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    has_children = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    department_id = table.Column<int>(type: "int", nullable: true),
                    position_id = table.Column<int>(type: "int", nullable: true),
                    employment_type = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    contract_start_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    contract_end_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    manager_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employees", x => x.employee_id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "profile_update_requests",
                columns: table => new
                {
                    update_request_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    request_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    reviewed_by = table.Column<int>(type: "int", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    reject_reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    comment = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profile_update_requests", x => x.update_request_id);
                    table.ForeignKey(
                        name: "FK_profile_update_requests_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    request_type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    approver_id = table.Column<int>(type: "int", nullable: true),
                    approved_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    reject_reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_requests", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_requests_employees_approver_id",
                        column: x => x.approver_id,
                        principalTable: "employees",
                        principalColumn: "employee_id");
                    table.ForeignKey(
                        name: "FK_requests_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "timesheets",
                columns: table => new
                {
                    timesheet_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    work_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    check_in_time = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    check_out_time = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    total_hours = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    is_late = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    late_minutes = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_timesheets", x => x.timesheet_id);
                    table.ForeignKey(
                        name: "FK_timesheets_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "profile_update_request_details",
                columns: table => new
                {
                    detail_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    update_request_id = table.Column<int>(type: "int", nullable: false),
                    field_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    old_value = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    new_value = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profile_update_request_details", x => x.detail_id);
                    table.ForeignKey(
                        name: "FK_profile_update_request_details_profile_update_requests_updat~",
                        column: x => x.update_request_id,
                        principalTable: "profile_update_requests",
                        principalColumn: "update_request_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "leave_requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    leave_type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    start_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    half_day = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    handover_employee_id = table.Column<int>(type: "int", nullable: true),
                    attachment_path = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_leave_requests", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_leave_requests_employees_handover_employee_id",
                        column: x => x.handover_employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id");
                    table.ForeignKey(
                        name: "FK_leave_requests_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "requests",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "overtime_requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    ot_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "time(6)", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "time(6)", nullable: false),
                    total_hours = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    ot_reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    project_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overtime_requests", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_overtime_requests_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "requests",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "resignation_requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    proposed_last_working_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    resign_reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    has_completed_handover = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    hr_note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resignation_requests", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_resignation_requests_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "requests",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "timesheet_update_requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    timesheet_id = table.Column<int>(type: "int", nullable: false),
                    old_check_in = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    old_check_out = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    new_check_in = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    new_check_out = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_timesheet_update_requests", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_timesheet_update_requests_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "requests",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_timesheet_update_requests_timesheets_timesheet_id",
                        column: x => x.timesheet_id,
                        principalTable: "timesheets",
                        principalColumn: "timesheet_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_leave_requests_handover_employee_id",
                table: "leave_requests",
                column: "handover_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_profile_update_request_details_update_request_id",
                table: "profile_update_request_details",
                column: "update_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_profile_update_requests_employee_id",
                table: "profile_update_requests",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_requests_approver_id",
                table: "requests",
                column: "approver_id");

            migrationBuilder.CreateIndex(
                name: "IX_requests_employee_id",
                table: "requests",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_timesheet_update_requests_timesheet_id",
                table: "timesheet_update_requests",
                column: "timesheet_id");

            migrationBuilder.CreateIndex(
                name: "IX_timesheets_employee_id",
                table: "timesheets",
                column: "employee_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "leave_requests");

            migrationBuilder.DropTable(
                name: "overtime_requests");

            migrationBuilder.DropTable(
                name: "profile_update_request_details");

            migrationBuilder.DropTable(
                name: "resignation_requests");

            migrationBuilder.DropTable(
                name: "timesheet_update_requests");

            migrationBuilder.DropTable(
                name: "profile_update_requests");

            migrationBuilder.DropTable(
                name: "requests");

            migrationBuilder.DropTable(
                name: "timesheets");

            migrationBuilder.DropTable(
                name: "employees");
        }
    }
}
