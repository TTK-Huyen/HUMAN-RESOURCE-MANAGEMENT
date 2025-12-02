using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRMApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Hours",
                table: "OvertimeRequests");

            migrationBuilder.RenameColumn(
                name: "ResignDate",
                table: "ResignationRequests",
                newName: "ResignationDate");

            migrationBuilder.RenameColumn(
                name: "OvertimeDate",
                table: "OvertimeRequests",
                newName: "Date");

            migrationBuilder.AddColumn<int>(
                name: "HandoverToHr",
                table: "ResignationRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "OvertimeRequests",
                type: "time(6)",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "OvertimeRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "OvertimeRequests",
                type: "time(6)",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<string>(
                name: "AttachmentsBase64",
                table: "LeaveRequests",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "HandoverPersonId",
                table: "LeaveRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_HandoverPersonId",
                table: "LeaveRequests",
                column: "HandoverPersonId");

            migrationBuilder.AddForeignKey(
                name: "FK_LeaveRequests_Employees_HandoverPersonId",
                table: "LeaveRequests",
                column: "HandoverPersonId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LeaveRequests_Employees_HandoverPersonId",
                table: "LeaveRequests");

            migrationBuilder.DropIndex(
                name: "IX_LeaveRequests_HandoverPersonId",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "HandoverToHr",
                table: "ResignationRequests");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "OvertimeRequests");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "OvertimeRequests");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "OvertimeRequests");

            migrationBuilder.DropColumn(
                name: "AttachmentsBase64",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "HandoverPersonId",
                table: "LeaveRequests");

            migrationBuilder.RenameColumn(
                name: "ResignationDate",
                table: "ResignationRequests",
                newName: "ResignDate");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "OvertimeRequests",
                newName: "OvertimeDate");

            migrationBuilder.AddColumn<double>(
                name: "Hours",
                table: "OvertimeRequests",
                type: "double",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
