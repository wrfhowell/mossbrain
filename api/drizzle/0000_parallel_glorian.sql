CREATE TABLE "entries" (
	"id" text PRIMARY KEY NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"source" text DEFAULT 'telegram' NOT NULL,
	"telegram_chat_id" bigint,
	"telegram_message_id" bigint,
	"visibility" text DEFAULT 'public' NOT NULL,
	"body" text NOT NULL,
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry_labels" (
	"entry_id" text NOT NULL,
	"label_id" text NOT NULL,
	CONSTRAINT "entry_labels_entry_id_label_id_pk" PRIMARY KEY("entry_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "labels" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "labels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"filename" text,
	"mime_type" text,
	"width" integer,
	"height" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"telegram_file_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"body" text NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entry_labels" ADD CONSTRAINT "entry_labels_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_labels" ADD CONSTRAINT "entry_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_telegram_msg" ON "entries" USING btree ("telegram_chat_id","telegram_message_id");--> statement-breakpoint
CREATE INDEX "idx_entries_published_at" ON "entries" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_media_entry_id" ON "media" USING btree ("entry_id");