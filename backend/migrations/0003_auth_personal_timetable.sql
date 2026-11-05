-- Campus Companion migration 0003
-- Adds authentication credentials and personal timetable entries.
-- REVIEW ONLY: do not execute until approved.

BEGIN;

ALTER TABLE public.users
    ADD COLUMN email_verified_at TIMESTAMP WITHOUT TIME ZONE;

CREATE TABLE public.user_credentials (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT user_credentials_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON DELETE CASCADE
);

CREATE TABLE public.personal_timetable_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_code TEXT,
    title TEXT NOT NULL,
    weekday INTEGER NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    lecturer TEXT,
    room_label TEXT,
    place_id TEXT,
    course_section_id TEXT,
    source TEXT NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT personal_timetable_entries_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON DELETE CASCADE,

    CONSTRAINT personal_timetable_entries_place_id_fkey
        FOREIGN KEY (place_id)
        REFERENCES public.places (id)
        ON DELETE SET NULL,

    CONSTRAINT personal_timetable_entries_course_section_id_fkey
        FOREIGN KEY (course_section_id)
        REFERENCES public.course_sections (id)
        ON DELETE SET NULL,

    CONSTRAINT personal_timetable_entries_weekday_check
        CHECK (weekday BETWEEN 1 AND 7),

    CONSTRAINT personal_timetable_entries_time_check
        CHECK (start_time < end_time),

    CONSTRAINT personal_timetable_entries_source_check
        CHECK (source IN ('manual', 'upload', 'official'))
);

CREATE INDEX personal_timetable_entries_user_weekday_idx
    ON public.personal_timetable_entries (user_id, weekday, start_time);

CREATE INDEX personal_timetable_entries_course_section_idx
    ON public.personal_timetable_entries (course_section_id)
    WHERE course_section_id IS NOT NULL;

COMMIT;
