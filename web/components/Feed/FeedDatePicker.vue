<script setup lang="ts">
import {
	CalendarDate,
	DateFormatter,
	type DateValue,
	getLocalTimeZone,
} from '@internationalized/date';
import dayjs from 'dayjs';
import type { DateRange } from 'reka-ui';

// Get query params
const { params } = useRoute();
// YYYY-MM-DD
const paramsDate = params.date as string | undefined;
const paramsCategory = (params.category as string | undefined) || 'world';
const queryDate = paramsDate ?? dayjs().format('YYYY-MM-DD');

const date = dayjs(queryDate).toDate();

const router = useRouter();

const df = new DateFormatter('en-US', {
	dateStyle: 'medium',
});

const modelValue = shallowRef(
	new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
);

const onDateChange = (
	newDate: DateRange | DateValue | DateValue[] | null | undefined,
) => {
	if (!newDate || 'start' in newDate || Array.isArray(newDate)) {
		return;
	}

	const nowDayJS = dayjs();
	const newDateDayJS = dayjs(newDate.toDate(getLocalTimeZone()));

	if (newDateDayJS.isAfter(nowDayJS)) {
		// set date to today
		modelValue.value = new CalendarDate(
			nowDayJS.year(),
			nowDayJS.month() + 1,
			nowDayJS.date(),
		);
		alert('Cannot select future date');
		return;
	}

	// If the date selected is older than 25 days, return
	if (newDateDayJS.isBefore(nowDayJS.subtract(25, 'days'))) {
		modelValue.value = new CalendarDate(
			nowDayJS.year(),
			nowDayJS.month() + 1,
			nowDayJS.date(),
		);
		alert('Cannot select date older than 25 days');
		return;
	}

	const newQueryDate = newDateDayJS.format('YYYY-MM-DD').toString();

	const reg = /\/\d{4}-\d{2}-\d{2}/;

	if (reg.test(router.currentRoute.value.fullPath)) {
		router.push({ params: { date: newQueryDate } });
		return;
	}

	const url = `/category/${paramsCategory}/${newQueryDate}`;
	router.replace(url);
	history.pushState({}, '', url); // Write to history to enable back button
};
</script>

<template>
	<UPopover>
		<UButton color="info" variant="subtle" icon="i-lucide-calendar">
			{{ df.format(modelValue.toDate(getLocalTimeZone())) }}
		</UButton>

		<template #content>
			<UCalendar v-model="modelValue" class="p-2" @update:modelValue="onDateChange" />
		</template>
	</UPopover>
</template>