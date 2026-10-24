// Never report a live integration as passing because configuration is absent.
const mode = process.argv[2] === "db" ? "database" : "Neon/R2";
console.error(
  JSON.stringify({
    status: "BLOCKED",
    scope: mode,
    reason:
      "Disposable Neon project/branch, real Worker auth propagation, migration/rollback and scoped R2 fixtures have not been verified. No production connection or migration is attempted.",
    exitCode: 2,
  }),
);
process.exitCode = 2;
