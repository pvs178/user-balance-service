import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1763988725411 implements MigrationInterface {
    name = 'Migration1763988725411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "balance" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_history_action_enum" AS ENUM('debit', 'credit')`);
        await queryRunner.query(`CREATE TABLE "transaction_history" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "action" "public"."transaction_history_action_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, "ts" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1e2444ea77f6b5952b4ab7cb9a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transaction_history" ADD CONSTRAINT "FK_f77094419e595b6e75f829f9b3c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_history" DROP CONSTRAINT "FK_f77094419e595b6e75f829f9b3c"`);
        await queryRunner.query(`DROP TABLE "transaction_history"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_history_action_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
