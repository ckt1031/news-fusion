CREATE TABLE IF NOT EXISTS "articles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "articles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guid" text NOT NULL,
	"link" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"thumbnail" text,
	"category" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"publisher" text NOT NULL,
	"similarities" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "articles_id_unique" UNIQUE("id")
);
