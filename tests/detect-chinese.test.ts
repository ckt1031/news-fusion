import { expect, test } from 'bun:test';
import { isMostlyChinese } from '../src/lib/detect-chinese';

test('Detect Chinese Amount', async () => {
	expect(isMostlyChinese('Whats up?')).toBe(false);
	expect(isMostlyChinese('你好')).toBe(true);

	const paragraph1 = `
  隨著科技的進步，我們的生活越來越便利。智慧型手機的普及，讓我們隨時隨地都能夠連接到網際網路。
  透過App，我們可以訂餐、叫車、購物，甚至學習外語。例如，使用Duolingo學習英文，或者使用Tandem與世界各地的人交談。
  科技的發展，讓世界變得更小，文化交流也更加頻繁。
  `;

	expect(isMostlyChinese(paragraph1)).toBe(true);

	const paragraph2 = `
  In the bustling city of Hong Kong, you'll find aIn the bustling city of Taipei,
  amidst the vibrant night markets and towering skyscrapers, one can find a 便利店 on every corner.
  These 便利店, or bian li dian in Mandarin, are akin to oases in the desert,
  providing a myriad of goods and services to weary travelers and locals alike.
  From grabbing a quick 杯麵 for a late-night snack to picking up everyday essentials like 衛生紙 and 瓶裝水,
  these stores are a lifeline for those on the go. The city truly never sleeps,
  and with the convenience of these 24-hour stores, one can always find a helping hand,
  or a much-needed snack, no matter the hour.
  `;

	expect(isMostlyChinese(paragraph2)).toBe(false);
});
