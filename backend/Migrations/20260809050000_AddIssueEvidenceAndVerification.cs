using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIssueEvidenceAndVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add verification columns to Issues
            migrationBuilder.AddColumn<int>(
                name: "VerifiedByUserId",
                table: "Issues",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerifiedAt",
                table: "Issues",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReworkNotes",
                table: "Issues",
                type: "text",
                nullable: true);

            // Add FK constraint for VerifiedBy
            migrationBuilder.AddForeignKey(
                name: "FK_Issues_Users_VerifiedByUserId",
                table: "Issues",
                column: "VerifiedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.CreateIndex(
                name: "IX_Issues_VerifiedByUserId",
                table: "Issues",
                column: "VerifiedByUserId");

            // Create IssueEvidences table
            migrationBuilder.CreateTable(
                name: "IssueEvidences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IssueId = table.Column<int>(type: "integer", nullable: false),
                    UploadedByUserId = table.Column<int>(type: "integer", nullable: false),
                    ImageType = table.Column<string>(type: "text", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    StoragePath = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IssueEvidences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IssueEvidences_Issues_IssueId",
                        column: x => x.IssueId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IssueEvidences_Users_UploadedByUserId",
                        column: x => x.UploadedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IssueEvidences_IssueId",
                table: "IssueEvidences",
                column: "IssueId");

            migrationBuilder.CreateIndex(
                name: "IX_IssueEvidences_UploadedByUserId",
                table: "IssueEvidences",
                column: "UploadedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "IssueEvidences");

            migrationBuilder.DropForeignKey(
                name: "FK_Issues_Users_VerifiedByUserId",
                table: "Issues");

            migrationBuilder.DropIndex(
                name: "IX_Issues_VerifiedByUserId",
                table: "Issues");

            migrationBuilder.DropColumn(name: "VerifiedByUserId", table: "Issues");
            migrationBuilder.DropColumn(name: "VerifiedAt", table: "Issues");
            migrationBuilder.DropColumn(name: "ReworkNotes", table: "Issues");
        }
    }
}
