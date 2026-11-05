import pytest

import app.services.srux as srux


@pytest.fixture
def sample_options():
    return {
        "BCA": {
            "Second Year": ["25CAIBC00B02", "25CAIBC00B01"],
            "First Year": ["24CAIBC00B01"],
        },
        "BTech": {
            "First Year": ["25BT001"],
        },
    }


@pytest.fixture
def sample_timetable():
    return {
        "degree": "BCA",
        "year": "Second Year",
        "batch": "25CAIBC00B01",
        "lastUpdated": "2026-11-04",
        "timetable": {
            "Monday": [
                {
                    "time": "09:00",
                    "subjects": [
                        {
                            "unique_id": "class-001",
                            "coursecode": "CS201",
                            "subject": "Data Structures",
                            "facultyName": "Dr Example",
                            "room_name": "Room 204",
                        }
                    ],
                },
                {
                    "time": "10:00",
                    "subjects": ["Free Slot"],
                },
            ],
            "Tuesday": [
                {
                    "time": "11:30",
                    "subjects": [
                        {
                            "unique_id": "class-002",
                            "coursecode": None,
                            "subject": "Computer Networks",
                            "facultyName": None,
                            "room_name": "Lab 2",
                        }
                    ],
                }
            ],
            "Wednesday": [],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
            "Sunday": [],
        },
    }


def test_fetch_options_returns_validated_degree_year_and_batches(
    monkeypatch, sample_options
):
    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_options,
    )

    result = srux.fetch_options()

    assert len(result) == 2
    assert result[0]["degree"] == "BCA"
    assert result[0]["years"][0]["year"] == "First Year"
    assert result[0]["years"][1]["batches"] == [
        "25CAIBC00B01",
        "25CAIBC00B02",
    ]


def test_fetch_options_rejects_empty_usable_options(monkeypatch):
    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: {},
    )

    with pytest.raises(srux.SruxError):
        srux.fetch_options()


def test_validate_selection_accepts_an_official_batch(
    monkeypatch, sample_options
):
    monkeypatch.setattr(
        srux,
        "fetch_options",
        lambda: [
            {
                "degree": "BCA",
                "years": [
                    {
                        "year": "Second Year",
                        "batches": ["25CAIBC00B01"],
                    }
                ],
            }
        ],
    )

    # A valid selection returns normally.
    assert (
        srux.validate_selection(
            "BCA",
            "Second Year",
            "25CAIBC00B01",
        )
        is None
    )


def test_validate_selection_rejects_unlisted_batch(monkeypatch):
    monkeypatch.setattr(
        srux,
        "fetch_options",
        lambda: [
            {
                "degree": "BCA",
                "years": [
                    {
                        "year": "Second Year",
                        "batches": ["25CAIBC00B01"],
                    }
                ],
            }
        ],
    )

    with pytest.raises(srux.SruxError):
        srux.validate_selection(
            "BCA",
            "Second Year",
            "25CAIBC00B99",
        )


def test_validate_selection_rejects_invalid_batch_id():
    with pytest.raises(srux.SruxError):
        srux.validate_selection(
            "BCA",
            "Second Year",
            "../invalid",
        )


def test_fetch_timetable_normalizes_classes_and_skips_free_slots(
    monkeypatch, sample_timetable
):
    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    result = srux.fetch_timetable("25CAIBC00B01")

    assert result["degree"] == "BCA"
    assert result["academic_year"] == "Second Year"
    assert result["batch_id"] == "25CAIBC00B01"
    assert result["source_last_updated"] == "2026-11-04"

    # The free slot must not become a class.
    assert len(result["classes"]) == 2

    monday_class = result["classes"][0]
    assert monday_class["source_record_id"] == "class-001"
    assert monday_class["code"] == "CS201"
    assert monday_class["title"] == "Data Structures"
    assert monday_class["day"] == "MON"
    assert monday_class["weekday"] == 1
    assert monday_class["start_time"] == "09:00:00"
    assert monday_class["end_time"] == "10:00:00"
    assert monday_class["lecturer"] == "Dr Example"
    assert monday_class["room"] == "Room 204"

    tuesday_class = result["classes"][1]
    assert tuesday_class["source_record_id"] == "class-002"
    assert tuesday_class["code"] == ""
    assert tuesday_class["title"] == "Computer Networks"
    assert tuesday_class["day"] == "TUE"
    assert tuesday_class["weekday"] == 2
    assert tuesday_class["start_time"] == "11:30:00"
    assert tuesday_class["end_time"] == "12:30:00"
    assert tuesday_class["lecturer"] is None
    assert tuesday_class["room"] == "Lab 2"


def test_fetch_timetable_rejects_invalid_batch_id():
    with pytest.raises(srux.SruxError):
        srux.fetch_timetable("../invalid")


def test_fetch_timetable_rejects_mismatched_batch(
    monkeypatch, sample_timetable
):
    sample_timetable["batch"] = "ANOTHER_BATCH"

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(srux.SruxError):
        srux.fetch_timetable("25CAIBC00B01")


def test_fetch_timetable_rejects_duplicate_class_ids(
    monkeypatch, sample_timetable
):
    duplicate = {
        "unique_id": "class-001",
        "coursecode": "CS202",
        "subject": "Another Subject",
    }

    sample_timetable["timetable"]["Tuesday"] = [
        {
            "time": "10:00",
            "subjects": [duplicate],
        }
    ]

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(srux.SruxError):
        srux.fetch_timetable("25CAIBC00B01")


def test_fetch_timetable_rejects_class_without_stable_id(
    monkeypatch, sample_timetable
):
    sample_timetable["timetable"]["Monday"][0]["subjects"] = [
        {
            "coursecode": "CS201",
            "subject": "Data Structures",
        }
    ]

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(srux.SruxError):
        srux.fetch_timetable("25CAIBC00B01")


def test_fetch_timetable_rejects_class_without_subject_name(
    monkeypatch, sample_timetable
):
    sample_timetable["timetable"]["Monday"][0]["subjects"][0][
        "subject"
    ] = " "

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(srux.SruxError):
        srux.fetch_timetable("25CAIBC00B01")


@pytest.mark.parametrize(
    "invalid_time",
    [
        "08:00",
        "08:45",
        "21:00",
        "not-a-time",
        None,
    ],
)
def test_fetch_timetable_rejects_unsupported_slot_times(
    monkeypatch, sample_timetable, invalid_time
):
    sample_timetable["timetable"]["Monday"][0]["time"] = invalid_time

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(srux.SruxError):
        srux.fetch_timetable("25CAIBC00B01")


def test_fetch_timetable_rejects_invalid_day_structure(
    monkeypatch, sample_timetable
):
    sample_timetable["timetable"]["Monday"] = "not-a-list"

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(srux.SruxError):
        srux.fetch_timetable("25CAIBC00B01")


def test_fetch_timetable_rejects_invalid_subject_structure(
    monkeypatch, sample_timetable
):
    sample_timetable["timetable"]["Monday"][0]["subjects"] = "not-a-list"

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(srux.SruxError):
        srux.fetch_timetable("25CAIBC00B01")


def test_fetch_timetable_accepts_2030_class_and_ends_at_2130(
    monkeypatch, sample_timetable
):
    sample_timetable["timetable"]["Monday"] = [
        {
            "time": "20:30",
            "subjects": [
                {
                    "unique_id": "last-class",
                    "coursecode": "CS399",
                    "subject": "Evening Class",
                    "facultyName": "Dr Example",
                    "room_name": "Room 101",
                }
            ],
        }
    ]

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    result = srux.fetch_timetable("25CAIBC00B01")

    evening_classes = [
        item
        for item in result["classes"]
        if item["source_record_id"] == "last-class"
    ]

    assert len(evening_classes) == 1

    evening_class = evening_classes[0]
    assert evening_class["start_time"] == "20:30:00"
    assert evening_class["end_time"] == "21:30:00"
    assert evening_class["start_label"] == "08:30 PM"
    assert evening_class["end_label"] == "09:30 PM"


def test_fetch_timetable_rejects_missing_weekday(
    monkeypatch, sample_timetable
):
    del sample_timetable["timetable"]["Sunday"]

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(
        srux.SruxError,
        match="incomplete timetable",
    ):
        srux.fetch_timetable("25CAIBC00B01")


def test_fetch_timetable_rejects_invalid_weekday_list(
    monkeypatch, sample_timetable
):
    sample_timetable["timetable"]["Sunday"] = None

    monkeypatch.setattr(
        srux,
        "_fetch_json",
        lambda url: sample_timetable,
    )

    with pytest.raises(
        srux.SruxError,
        match="invalid Sunday timetable",
    ):
        srux.fetch_timetable("25CAIBC00B01")
