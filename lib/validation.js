const unsafeHtmlRegex = /[<>]/;
const positiveIntegerRegex = /^[1-9]\d*$/;
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,100}$/;

export function isPositiveInteger(value) {
    return positiveIntegerRegex.test(String(value));
}

export function isSafeText(value, maxLength) {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    return value.length <= maxLength && !unsafeHtmlRegex.test(value);
}

export function isValidPassword(value) {
    return typeof value === 'string' && passwordRegex.test(value);
}

export function normalizeDateTime(value) {
    if (typeof value !== 'string' || !dateTimeRegex.test(value)) return null;

    const normalized = value.replace('T', ' ');
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) return null;

    return normalized.length === 16 ? `${normalized}:00` : normalized;
}

export function validateCourseInput(course) {
    const {
        title,
        description,
        category,
        instructor,
        start_time,
        end_time,
        location,
        capacity,
        status = 'draft',
    } = course;

    if (!title || !instructor || !start_time || !end_time || !capacity) {
        return { error: 'title, instructor, start_time, end_time and capacity are required.' };
    }

    if (!isSafeText(title, 100)) {
        return { error: 'Title must be 100 characters or fewer and cannot contain HTML tags.' };
    }

    if (!isSafeText(description, 1000)) {
        return { error: 'Description must be 1000 characters or fewer and cannot contain HTML tags.' };
    }

    if (!isSafeText(category, 50)) {
        return { error: 'Category must be 50 characters or fewer and cannot contain HTML tags.' };
    }

    if (!isSafeText(instructor, 100)) {
        return { error: 'Instructor must be 100 characters or fewer and cannot contain HTML tags.' };
    }

    if (!isSafeText(location, 150)) {
        return { error: 'Location must be 150 characters or fewer and cannot contain HTML tags.' };
    }

    if (!isPositiveInteger(capacity)) {
        return { error: 'capacity must be a positive integer.' };
    }

    if (!['draft', 'published', 'cancelled'].includes(status)) {
        return { error: 'status must be draft, published, or cancelled.' };
    }

    const normalizedStartTime = normalizeDateTime(start_time);
    const normalizedEndTime = normalizeDateTime(end_time);

    if (!normalizedStartTime || !normalizedEndTime) {
        return { error: 'start_time and end_time must use YYYY-MM-DD HH:mm:ss format.' };
    }

    if (new Date(normalizedEndTime) <= new Date(normalizedStartTime)) {
        return { error: 'end_time must be later than start_time.' };
    }

    return {
        value: {
            title: title.trim(),
            description: description ? description.trim() : null,
            category: category ? category.trim() : null,
            instructor: instructor.trim(),
            start_time: normalizedStartTime,
            end_time: normalizedEndTime,
            location: location ? location.trim() : null,
            capacity: parseInt(capacity, 10),
            status,
        },
    };
}
