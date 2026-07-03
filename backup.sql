--
-- PostgreSQL database dump
--

\restrict B0cawvgVTfyeHgLUl6FnBkcnTSlU1irWSdadNfxdjkziG07BajzjYYRt71y67lU

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _RolePermissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_RolePermissions" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "authorId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "featuredImage" text,
    keywords text,
    "seoDescription" text,
    "seoTitle" text,
    tags text,
    "sortNumber" integer,
    "titleEn" text,
    "excerptEn" text,
    "contentEn" text,
    "seoTitleEn" text,
    "seoDescriptionEn" text,
    "keywordsEn" text,
    "tagsEn" text
);


--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certifications (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    title text NOT NULL,
    issuer text,
    "issueDate" timestamp(3) without time zone,
    url text,
    keywords text,
    "seoDescription" text,
    "seoTitle" text,
    slug text,
    tags text,
    "titleEn" text,
    "issuerEn" text
);


--
-- Name: certifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certifications_id_seq OWNED BY public.certifications.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name text NOT NULL,
    "logoUrl" text,
    website text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: educations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.educations (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    institution text NOT NULL,
    degree text,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    keywords text,
    "seoDescription" text,
    "seoTitle" text,
    slug text,
    tags text,
    "institutionEn" text,
    "degreeEn" text,
    "descriptionEn" text
);


--
-- Name: educations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.educations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: educations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.educations_id_seq OWNED BY public.educations.id;


--
-- Name: frontend_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.frontend_settings (
    id integer NOT NULL,
    key text DEFAULT 'default'::text NOT NULL,
    "siteTitle" text,
    "siteDescription" text,
    "seoTitle" text,
    "seoDescription" text,
    "seoKeywords" text,
    "canonicalUrl" text,
    "ogImageUrl" text,
    "footerText" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ogImageAlt" text,
    "organizationName" text,
    "organizationLogoUrl" text,
    "defaultAuthorName" text,
    "defaultLocale" text,
    "twitterHandle" text,
    "socialProfileUrls" text,
    "googleSiteVerification" text,
    "bingSiteVerification" text,
    "themeColor" text,
    "clarityProjectId" text
);


--
-- Name: frontend_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.frontend_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: frontend_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.frontend_settings_id_seq OWNED BY public.frontend_settings.id;


--
-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    name text NOT NULL,
    proficiency text,
    keywords text,
    "seoDescription" text,
    "seoTitle" text,
    slug text,
    tags text
);


--
-- Name: languages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.languages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.languages_id_seq OWNED BY public.languages.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolios (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    "imageUrl" text,
    "projectUrl" text,
    "workForId" integer,
    "workAtId" integer,
    tags text,
    featured boolean DEFAULT false NOT NULL,
    "isDisabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL,
    keywords text,
    "seoDescription" text,
    "seoTitle" text,
    slug text,
    "sortNumber" integer,
    "titleEn" text,
    "descriptionEn" text,
    "seoTitleEn" text,
    "seoDescriptionEn" text,
    "keywordsEn" text,
    "tagsEn" text
);


--
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: security_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_audit_logs (
    id integer NOT NULL,
    event text NOT NULL,
    status text NOT NULL,
    route text NOT NULL,
    method text NOT NULL,
    "actorId" integer,
    detail jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: security_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.security_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: security_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.security_audit_logs_id_seq OWNED BY public.security_audit_logs.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    name text NOT NULL,
    level integer,
    notes text,
    keywords text,
    "seoDescription" text,
    "seoTitle" text,
    slug text,
    tags text,
    "nameEn" text,
    "notesEn" text
);


--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    avatar text,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "roleId" integer NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: work_experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_experiences (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    location text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "companyId" integer,
    "endMonth" integer,
    "endYear" integer,
    "isCurrent" boolean DEFAULT false NOT NULL,
    "position" text NOT NULL,
    "startMonth" integer NOT NULL,
    "startYear" integer NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    keywords text,
    "seoDescription" text,
    "seoTitle" text,
    slug text,
    "positionEn" text,
    "descriptionEn" text
);


--
-- Name: work_experiences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_experiences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_experiences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_experiences_id_seq OWNED BY public.work_experiences.id;


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: certifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications ALTER COLUMN id SET DEFAULT nextval('public.certifications_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: educations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educations ALTER COLUMN id SET DEFAULT nextval('public.educations_id_seq'::regclass);


--
-- Name: frontend_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frontend_settings ALTER COLUMN id SET DEFAULT nextval('public.frontend_settings_id_seq'::regclass);


--
-- Name: languages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages ALTER COLUMN id SET DEFAULT nextval('public.languages_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: security_audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.security_audit_logs_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: work_experiences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_experiences ALTER COLUMN id SET DEFAULT nextval('public.work_experiences_id_seq'::regclass);


--
-- Data for Name: _RolePermissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_RolePermissions" ("A", "B") FROM stdin;
1	2
11	2
12	2
13	2
14	2
15	2
2	2
3	2
4	2
19	2
20	2
21	2
22	2
23	2
24	2
25	2
7	2
8	2
9	2
29	2
30	2
5	2
6	2
12	1
13	1
14	1
15	1
2	1
3	1
4	1
19	1
20	1
21	1
22	1
23	1
24	1
25	1
7	1
8	1
9	1
29	1
30	1
2	5
3	5
19	5
20	5
22	5
23	5
25	5
7	5
8	5
9	5
30	5
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d406afae-710c-412c-b177-3b87c32083c6	64f6c8b851994a85e3806b1efbb4eb7b06dfd9574b238fc874ddd26097d513f8	\N	20260703000100_add_sort_number_to_article_and_portfolio	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260703000100_add_sort_number_to_article_and_portfolio\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "Article" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"Article\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(639), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260703000100_add_sort_number_to_article_and_portfolio"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260703000100_add_sort_number_to_article_and_portfolio"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255	2026-07-02 16:44:25.107472+07	2026-07-02 16:43:57.324469+07	0
23082bb5-b35a-4024-8105-2009ac97c23e	ecb26e3a70428d5e0e9e7e134cd9e886ddc8611929779b32e95c12de56ae9011	2026-07-02 13:34:06.8053+07	20260523215420_init_postgresql	\N	\N	2026-07-02 13:34:06.532323+07	1
375f4054-7e3a-42a1-8e70-408164de4da4	e0b7824f17d9325ca56234d968c39b6771219bc1499ea99f2fb2502cd94d59d8	2026-07-02 13:34:06.908604+07	20260524132100_rbac_complete_migration	\N	\N	2026-07-02 13:34:06.806353+07	1
8564e6da-15de-4dbe-b6c9-9df819a4e777	60729862be6ddf4c1a0214fb429fdf239c473c43e70a5f0849a50c4f4d874af5	2026-07-02 13:34:06.916954+07	20260613021303_basedb	\N	\N	2026-07-02 13:34:06.909503+07	1
bdf132d5-ece3-439c-9c1f-8c64e15b2cab	e6e9b7189b2cc51c8f630b5f4f2f261cd8ad786702fe703424f83be5ba69b44e	2026-07-02 16:44:37.237985+07	20260703000100_add_sort_number_to_article_and_portfolio	\N	\N	2026-07-02 16:44:37.165034+07	1
3207b44e-f67e-4015-9bb0-257a6b8f483c	633dfb861edbc5ed6132da83ab23225e276121f453c4e04bc3af56d5bb035c19	2026-07-02 13:34:06.937757+07	20260613025302_add_article	\N	\N	2026-07-02 13:34:06.917819+07	1
9350b472-3095-4a0a-8798-01b0277816fe	799a7fc5cbc59529bb35d2a53774f7cd6fe6db7ca39d0b0cb4fae55da57092e1	2026-07-02 13:34:06.942253+07	20260613031149_enhance_article	\N	\N	2026-07-02 13:34:06.938544+07	1
bcf22c1a-e39a-4248-9b75-341c991f13e8	36eaff349a2becf4a8f9e0ae0ee4b16eb71c7f54b6df44710b7573ac1762583b	2026-07-02 13:34:06.95433+07	20260613032011_add_seo_to_all_features	\N	\N	2026-07-02 13:34:06.94321+07	1
d2d351be-d009-4ce6-8368-44f006aa0ce1	f799835a7f1dd9be76b9fdcaced8a9c59888d20f612e71054fdfc1246ee4fcda	2026-07-03 12:50:31.624603+07	20260703020000_expand_frontend_settings_seo	\N	\N	2026-07-03 12:50:31.566651+07	1
80ce892b-b001-4857-ad30-ddb79dfaeaa4	a179483fa94a12ecbf1f6520ae94fdb87dddfecab57a1e572323f75d214338f0	2026-07-02 14:53:17.140671+07	20260702153000_security_audit_and_granular_permissions	\N	\N	2026-07-02 14:53:16.866748+07	1
7c9d3c70-9cad-4df5-946e-7d7256d7c6fb	32ff13b15fd414764cb71d3d2cfcd35a0112aac52b303f411e4c77643e036a1e	2026-07-02 14:53:17.15484+07	20260702172000_complete_rbac_defaults	\N	\N	2026-07-02 14:53:17.141824+07	1
847d32b1-aaf3-4c13-bf0d-2fbab89d7b15	14af952c26a32aa196197c3bfab493ab09bba978a22833fe6db365d334ef1018	2026-07-03 13:25:06.112069+07	20260703123000_add_bilingual_profile_fields	\N	\N	2026-07-03 13:25:06.045418+07	1
d8537565-fd9b-4bc9-9790-5a9e8e771e45	3b8765255f8215434f09721eeb5257272d5a3615078cc7ff4ad1648149a94da8	2026-07-02 14:53:17.192266+07	20260702193000_frontend_settings_and_permissions	\N	\N	2026-07-02 14:53:17.155668+07	1
cd2e6de8-ae54-43af-b398-4443a4ef3a4c	6a1f93b05db4755c27248cae8091d2bd38a096e00ceb1ef75b98faef031feadf	2026-07-03 12:53:41.283754+07	20260703024500_add_clarity_to_frontend_settings	\N	\N	2026-07-03 12:53:41.274425+07	1
c87e6aee-6d8b-4435-84aa-c849c702aa36	8b031704728415be17f13614ac679931cf4afa42b99b828d9e9f2d6228a4436b	2026-07-02 14:53:17.202628+07	20260702201000_rbac_permission_catalog_refresh	\N	\N	2026-07-02 14:53:17.193034+07	1
4d8a91af-94ed-44bc-b5b7-337b8699032c	717b4b7957102b9618b1b98028d4d25a1d43c2a93f7e66f5b071c0fa342d4783	2026-07-03 13:22:04.150416+07	20260703110000_add_bilingual_article_portfolio_fields	\N	\N	2026-07-03 13:22:04.116777+07	1
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.articles (id, title, slug, excerpt, content, "isPublished", "authorId", "createdAt", "updatedAt", "featuredImage", keywords, "seoDescription", "seoTitle", tags, "sortNumber", "titleEn", "excerptEn", "contentEn", "seoTitleEn", "seoDescriptionEn", "keywordsEn", "tagsEn") FROM stdin;
2	Sample Article 2	sample-article-1782984338401-2	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 2 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.398	\N	\N	\N	\N	sample,test,infinite	1	Sample Article 2	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 2 for Frimecraft article listing.</p>	Sample Article 2	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
4	Sample Article 4	sample-article-1782984338401-4	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 4 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.3	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 4	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 4 for Frimecraft article listing.</p>	Sample Article 4	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
5	Sample Article 5	sample-article-1782984338401-5	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 5 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.328	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 5	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 5 for Frimecraft article listing.</p>	Sample Article 5	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
6	Sample Article 6	sample-article-1782984338401-6	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 6 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.332	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 6	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 6 for Frimecraft article listing.</p>	Sample Article 6	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
7	Sample Article 7	sample-article-1782984338401-7	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 7 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.337	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 7	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 7 for Frimecraft article listing.</p>	Sample Article 7	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
8	Sample Article 8	sample-article-1782984338401-8	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 8 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.348	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 8	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 8 for Frimecraft article listing.</p>	Sample Article 8	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
9	Sample Article 9	sample-article-1782984338401-9	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 9 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.351	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 9	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 9 for Frimecraft article listing.</p>	Sample Article 9	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
10	Sample Article 10	sample-article-1782984338401-10	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 10 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.355	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 10	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 10 for Frimecraft article listing.</p>	Sample Article 10	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
11	Sample Article 11	sample-article-1782984338401-11	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 11 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.36	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 11	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 11 for Frimecraft article listing.</p>	Sample Article 11	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
12	Sample Article 12	sample-article-1782984338401-12	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 12 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.366	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 12	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 12 for Frimecraft article listing.</p>	Sample Article 12	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
13	Sample Article 13	sample-article-1782984338401-13	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 13 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.369	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 13	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 13 for Frimecraft article listing.</p>	Sample Article 13	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
14	Sample Article 14	sample-article-1782984338401-14	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 14 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.372	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 14	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 14 for Frimecraft article listing.</p>	Sample Article 14	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
15	Sample Article 15	sample-article-1782984338401-15	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 15 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.376	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 15	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 15 for Frimecraft article listing.</p>	Sample Article 15	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
16	Sample Article 16	sample-article-1782984338401-16	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 16 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.38	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 16	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 16 for Frimecraft article listing.</p>	Sample Article 16	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
18	Sample Article 18	sample-article-1782984338401-18	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 18 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.392	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 18	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 18 for Frimecraft article listing.</p>	Sample Article 18	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
17	Sample Article 17	sample-article-1782984338401-17	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 17 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.383	\N	\N	\N	\N	sample,test,infinite	\N	Sample Article 17	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 17 for Frimecraft article listing.</p>	Sample Article 17	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
1	Sample Article 1	sample-article-1782984338401-1	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 1 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.396	\N	\N	\N	\N	sample,test,infinite	2	Sample Article 1	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 1 for Frimecraft article listing.</p>	Sample Article 1	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
3	Sample Article 3	sample-article-1782984338401-3	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 3 for Frimecraft article listing.</p>	t	1	2026-07-02 09:25:38.446	2026-07-03 06:30:30.4	\N	\N	\N	\N	sample,test,infinite	3	Sample Article 3	Auto-seeded article for testing infinite loading behavior.	<p>Sample content block 3 for Frimecraft article listing.</p>	Sample Article 3	Auto-seeded article for testing infinite loading behavior.	\N	sample,test,infinite
\.


--
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.certifications (id, "userId", title, issuer, "issueDate", url, keywords, "seoDescription", "seoTitle", slug, tags, "titleEn", "issuerEn") FROM stdin;
1	1	Certified UX Designer	Design Institute	2021-06-01 00:00:00		\N	\N	\N	\N	\N	Certified UX Designer	Design Institute
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, "logoUrl", website, "createdAt") FROM stdin;
1	Frime Craft Studio	\N	https://frimecraft.com	2026-07-02 06:34:45.185
2	StartupX	\N	https://startupx.com	2026-07-02 06:34:45.191
\.


--
-- Data for Name: educations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.educations (id, "userId", institution, degree, "startDate", "endDate", description, "createdAt", "updatedAt", keywords, "seoDescription", "seoTitle", slug, tags, "institutionEn", "degreeEn", "descriptionEn") FROM stdin;
1	1	Institut Teknologi Contoh	S1 Desain Komunikasi Visual	2013-08-01 00:00:00	2017-06-01 00:00:00	Konsentrasi UI/UX dan multimedia.	2026-07-02 06:34:45.21	2026-07-03 06:30:30.518	\N	\N	\N	\N	\N	Institut Teknologi Contoh	S1 Desain Komunikasi Visual	Konsentrasi UI/UX dan multimedia.
\.


--
-- Data for Name: frontend_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.frontend_settings (id, key, "siteTitle", "siteDescription", "seoTitle", "seoDescription", "seoKeywords", "canonicalUrl", "ogImageUrl", "footerText", "createdAt", "updatedAt", "ogImageAlt", "organizationName", "organizationLogoUrl", "defaultAuthorName", "defaultLocale", "twitterHandle", "socialProfileUrls", "googleSiteVerification", "bingSiteVerification", "themeColor", "clarityProjectId") FROM stdin;
1	default	Frimecraft	Frimecraft digital profile, portfolio showcase, and journal.	Frimecraft	Frimecraft digital profile, portfolio showcase, and journal for product design and frontend execution.	frimecraft, portfolio, articles, frontend developer, ui ux, product design	https://frimecraft.com	https://frimecraft.com/assets/img/main/hero.svg	Frimecraft. Build clear products with sharp execution.	2026-07-03 05:50:48.348	2026-07-03 05:53:56.247	Frimecraft hero visual	Frimecraft Studio	https://frimecraft.com/assets/img/main/hero.svg	Faris Friansyah	id_ID	@frimecraft	https://www.linkedin.com,https://x.com/frimecraft	\N	\N	#2f55d4	\N
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.languages (id, "userId", name, proficiency, keywords, "seoDescription", "seoTitle", slug, tags) FROM stdin;
1	1	Indonesian	Native	\N	\N	\N	\N	\N
2	1	English	Fluent	\N	\N	\N	\N	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, name, description, "createdAt") FROM stdin;
1	all	Akses penuh ke seluruh sistem	2026-07-02 06:34:44.869
11	role.manage	Izin mengelola role dan permission	2026-07-02 14:53:17.145
12	user.read	Izin melihat daftar pengguna	2026-07-02 14:53:17.145
13	user.create	Izin membuat pengguna	2026-07-02 14:53:17.145
14	user.update	Izin mengubah pengguna	2026-07-02 14:53:17.145
15	user.delete	Izin menghapus pengguna	2026-07-02 14:53:17.145
2	portfolio.create	Izin membuat portofolio	2026-07-02 06:34:44.886
3	portfolio.update	Izin mengubah portofolio	2026-07-02 06:34:44.893
4	portfolio.delete	Izin menghapus portofolio	2026-07-02 06:34:44.9
19	article.create	Izin membuat artikel	2026-07-02 14:53:17.145
20	article.update	Izin mengubah artikel	2026-07-02 14:53:17.145
21	article.delete	Izin menghapus artikel	2026-07-02 14:53:17.145
22	experience.create	Izin membuat riwayat kerja	2026-07-02 14:53:17.145
23	experience.update	Izin mengubah riwayat kerja	2026-07-02 14:53:17.145
24	experience.delete	Izin menghapus riwayat kerja	2026-07-02 14:53:17.145
25	education.manage	Izin mengatur data pendidikan	2026-07-02 14:53:17.145
7	language.manage	Izin mengatur data bahasa	2026-07-02 14:53:17.128
8	skill.manage	Izin mengatur data skill	2026-07-02 14:53:17.128
9	certification.manage	Izin mengatur data sertifikasi	2026-07-02 14:53:17.128
29	company.manage	Izin mengelola data company	2026-07-02 14:53:17.145
30	frontend_settings.manage	Izin mengatur konfigurasi website frontend	2026-07-02 14:53:17.145
5	experience.manage	Izin legacy untuk kompatibilitas lama	2026-07-02 06:34:44.905
6	user.manage	Izin legacy untuk manajemen pengguna admin	2026-07-02 06:34:44.91
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolios (id, title, description, "imageUrl", "projectUrl", "workForId", "workAtId", tags, featured, "isDisabled", "createdAt", "updatedAt", "userId", keywords, "seoDescription", "seoTitle", slug, "sortNumber", "titleEn", "descriptionEn", "seoTitleEn", "seoDescriptionEn", "keywordsEn", "tagsEn") FROM stdin;
2	E-commerce Landing Page	Landing page konversi tinggi untuk brand FMCG.	\N	https://example.com/project/landing	\N	\N	landing,ecommerce,ui	f	f	2026-07-02 06:34:45.246	2026-07-03 06:30:30.477	1	\N	\N	\N	\N	1	E-commerce Landing Page	Landing page konversi tinggi untuk brand FMCG.	E-commerce Landing Page	Landing page konversi tinggi untuk brand FMCG.	\N	landing,ecommerce,ui
4	Sample Portfolio 2	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.412	1	\N	\N	\N	sample-portfolio-1782984338500-2	\N	Sample Portfolio 2	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 2	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
5	Sample Portfolio 3	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.416	1	\N	\N	\N	sample-portfolio-1782984338500-3	\N	Sample Portfolio 3	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 3	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
6	Sample Portfolio 4	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	t	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.419	1	\N	\N	\N	sample-portfolio-1782984338500-4	\N	Sample Portfolio 4	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 4	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
7	Sample Portfolio 5	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.423	1	\N	\N	\N	sample-portfolio-1782984338500-5	\N	Sample Portfolio 5	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 5	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
8	Sample Portfolio 6	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.426	1	\N	\N	\N	sample-portfolio-1782984338500-6	\N	Sample Portfolio 6	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 6	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
9	Sample Portfolio 7	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	t	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.429	1	\N	\N	\N	sample-portfolio-1782984338500-7	\N	Sample Portfolio 7	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 7	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
10	Sample Portfolio 8	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.432	1	\N	\N	\N	sample-portfolio-1782984338500-8	\N	Sample Portfolio 8	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 8	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
11	Sample Portfolio 9	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.435	1	\N	\N	\N	sample-portfolio-1782984338500-9	\N	Sample Portfolio 9	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 9	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
12	Sample Portfolio 10	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	t	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.437	1	\N	\N	\N	sample-portfolio-1782984338500-10	\N	Sample Portfolio 10	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 10	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
13	Sample Portfolio 11	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.44	1	\N	\N	\N	sample-portfolio-1782984338500-11	\N	Sample Portfolio 11	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 11	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
14	Sample Portfolio 12	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.443	1	\N	\N	\N	sample-portfolio-1782984338500-12	\N	Sample Portfolio 12	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 12	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
15	Sample Portfolio 13	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	t	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.447	1	\N	\N	\N	sample-portfolio-1782984338500-13	\N	Sample Portfolio 13	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 13	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
16	Sample Portfolio 14	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.45	1	\N	\N	\N	sample-portfolio-1782984338500-14	\N	Sample Portfolio 14	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 14	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
17	Sample Portfolio 15	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.453	1	\N	\N	\N	sample-portfolio-1782984338500-15	\N	Sample Portfolio 15	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 15	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
18	Sample Portfolio 16	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	t	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.456	1	\N	\N	\N	sample-portfolio-1782984338500-16	\N	Sample Portfolio 16	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 16	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
19	Sample Portfolio 17	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.461	1	\N	\N	\N	sample-portfolio-1782984338500-17	\N	Sample Portfolio 17	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 17	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
20	Sample Portfolio 18	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	f	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.465	1	\N	\N	\N	sample-portfolio-1782984338500-18	\N	Sample Portfolio 18	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 18	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
1	Product Dashboard UI	Redesign dashboard untuk SaaS manajemen tugas.	\N	https://example.com/project/admin	\N	\N	dashboard,saas,ui	t	f	2026-07-02 06:34:45.246	2026-07-03 06:30:30.468	1	\N	\N	\N	\N	3	Product Dashboard UI	Redesign dashboard untuk SaaS manajemen tugas.	Product Dashboard UI	Redesign dashboard untuk SaaS manajemen tugas.	\N	dashboard,saas,ui
3	Sample Portfolio 1	Auto-seeded portfolio for testing infinite loading behavior.	\N	https://example.com/project/sample	\N	\N	sample,portfolio,test	t	f	2026-07-02 09:25:38.522	2026-07-03 06:30:30.482	1	\N	\N	\N	sample-portfolio-1782984338500-1	2	Sample Portfolio 1	Auto-seeded portfolio for testing infinite loading behavior.	Sample Portfolio 1	Auto-seeded portfolio for testing infinite loading behavior.	\N	sample,portfolio,test
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
2	SUPER ADMIN	Akses penuh seluruh modul dan konfigurasi RBAC	2026-07-02 07:36:54.671	2026-07-03 05:53:55.847
1	ADMIN	Administrator operasional	2026-07-02 06:34:44.965	2026-07-03 05:53:55.921
5	EDITOR	Editor konten tanpa akses manajemen user/role	2026-07-02 14:53:17.147	2026-07-03 05:53:55.945
\.


--
-- Data for Name: security_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.security_audit_logs (id, event, status, route, method, "actorId", detail, "createdAt") FROM stdin;
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skills (id, "userId", name, level, notes, keywords, "seoDescription", "seoTitle", slug, tags, "nameEn", "notesEn") FROM stdin;
1	1	Figma	90	\N	\N	\N	\N	\N	\N	Figma	\N
2	1	Wireframing	85	\N	\N	\N	\N	\N	\N	Wireframing	\N
3	1	Prototyping	85	\N	\N	\N	\N	\N	\N	Prototyping	\N
4	1	Framer	75	\N	\N	\N	\N	\N	\N	Framer	\N
5	1	HTML/CSS	70	\N	\N	\N	\N	\N	\N	HTML/CSS	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, name, "createdAt", "updatedAt", avatar, "isActive", "lastLogin", "roleId") FROM stdin;
1	admin@frimecraft.com	$2b$10$zAt0xIBZWeR/kvdSz80mw.cpB01SotxEghd4wswmDSrsX92d13zCi	Admin FrimeCraft	2026-07-02 06:34:45.163	2026-07-03 05:53:56.195	\N	t	2026-07-02 09:52:58.256	2
\.


--
-- Data for Name: work_experiences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_experiences (id, "userId", location, description, "createdAt", "updatedAt", "companyId", "endMonth", "endYear", "isCurrent", "position", "startMonth", "startYear", tags, keywords, "seoDescription", "seoTitle", slug, "positionEn", "descriptionEn") FROM stdin;
1	1	Jakarta, Indonesia	Mendesain produk SaaS, dashboard, dan landing pages untuk klien enterprise.	2026-07-02 06:34:45.201	2026-07-03 06:30:30.501	1	\N	\N	t	Lead UX/UI Designer	1	2020	{UX,UI,Figma}	\N	\N	\N	\N	Lead UX/UI Designer	Mendesain produk SaaS, dashboard, dan landing pages untuk klien enterprise.
2	1	Remote	Membentuk alur pengguna, prototyping, dan desain visual.	2026-07-02 06:34:45.201	2026-07-03 06:30:30.504	2	12	2019	f	Product Designer	5	2018	{Product,Design}	\N	\N	\N	\N	Product Designer	Membentuk alur pengguna, prototyping, dan desain visual.
\.


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.articles_id_seq', 18, true);


--
-- Name: certifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.certifications_id_seq', 1, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.companies_id_seq', 2, true);


--
-- Name: educations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.educations_id_seq', 1, true);


--
-- Name: frontend_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.frontend_settings_id_seq', 2, true);


--
-- Name: languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.languages_id_seq', 2, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 125, true);


--
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 20, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 8, true);


--
-- Name: security_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.security_audit_logs_id_seq', 1, false);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.skills_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: work_experiences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.work_experiences_id_seq', 2, true);


--
-- Name: _RolePermissions _RolePermissions_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_RolePermissions"
    ADD CONSTRAINT "_RolePermissions_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: educations educations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educations
    ADD CONSTRAINT educations_pkey PRIMARY KEY (id);


--
-- Name: frontend_settings frontend_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frontend_settings
    ADD CONSTRAINT frontend_settings_pkey PRIMARY KEY (id);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: security_audit_logs security_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit_logs
    ADD CONSTRAINT security_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: work_experiences work_experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_experiences
    ADD CONSTRAINT work_experiences_pkey PRIMARY KEY (id);


--
-- Name: _RolePermissions_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_RolePermissions_B_index" ON public."_RolePermissions" USING btree ("B");


--
-- Name: articles_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX articles_slug_key ON public.articles USING btree (slug);


--
-- Name: companies_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX companies_name_key ON public.companies USING btree (name);


--
-- Name: frontend_settings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX frontend_settings_key_key ON public.frontend_settings USING btree (key);


--
-- Name: permissions_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);


--
-- Name: portfolios_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "portfolios_userId_idx" ON public.portfolios USING btree ("userId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: security_audit_logs_actorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "security_audit_logs_actorId_idx" ON public.security_audit_logs USING btree ("actorId");


--
-- Name: security_audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "security_audit_logs_createdAt_idx" ON public.security_audit_logs USING btree ("createdAt");


--
-- Name: security_audit_logs_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_audit_logs_event_idx ON public.security_audit_logs USING btree (event);


--
-- Name: security_audit_logs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_audit_logs_status_idx ON public.security_audit_logs USING btree (status);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: _RolePermissions _RolePermissions_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_RolePermissions"
    ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _RolePermissions _RolePermissions_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_RolePermissions"
    ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: articles articles_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: certifications certifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT "certifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: educations educations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.educations
    ADD CONSTRAINT "educations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: languages languages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT "languages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: portfolios portfolios_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT "portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: portfolios portfolios_workAtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT "portfolios_workAtId_fkey" FOREIGN KEY ("workAtId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: portfolios portfolios_workForId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT "portfolios_workForId_fkey" FOREIGN KEY ("workForId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: security_audit_logs security_audit_logs_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit_logs
    ADD CONSTRAINT "security_audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: skills skills_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT "skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_experiences work_experiences_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_experiences
    ADD CONSTRAINT "work_experiences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_experiences work_experiences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_experiences
    ADD CONSTRAINT "work_experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict B0cawvgVTfyeHgLUl6FnBkcnTSlU1irWSdadNfxdjkziG07BajzjYYRt71y67lU

