import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { calculateDiscount } from '../src/lib/discounts';
import { createServiceSchema, updateServiceSchema } from '../src/lib/validations/service';
import { categoryOrderSchema } from '../src/lib/validations/admin';
import { getServiceImage } from '../src/lib/serviceImages';

test('monthly package uses exact sale total, reference price and real per-session cost', () => {
    const sculpting = calculateDiscount({ price: 800, reference_price: 1200 });
    assert.equal(sculpting.originalPrice, 1200);
    assert.equal(sculpting.finalPrice, 800);
    assert.equal(sculpting.savingsAmount, 400);
    assert.equal(sculpting.finalPrice / 10, 80);
    const swedish = calculateDiscount({ price: 300, reference_price: 400 });
    assert.equal(swedish.finalPrice, 300);
    assert.equal(swedish.finalPrice / 4, 75);
    assert.equal(calculateDiscount({ price: 200 }).hasDiscount, false);
    assert.equal(calculateDiscount({ price: 200, discount_active: true, discount_percent: 25 }).finalPrice, 150);
});

test('admin accepts editable monthly terms without multiplying appointment duration', () => {
    const input = { name: 'Mensal Modeladora', category: 'mensal', price: 800, duration_minutes: 45, reference_price: 1200, session_count: 10, validity_days: 30 };
    const parsed = createServiceSchema.parse(input);
    assert.equal(parsed.duration_minutes, 45);
    assert.equal(parsed.session_count, 10);
    assert.deepEqual(updateServiceSchema.parse({ duration_minutes: 60 }), { duration_minutes: 60 });
    for (const patch of [{ session_count: 0 }, { session_count: 2.5 }, { validity_days: 0 }, { reference_price: -1 }]) {
        assert.equal(createServiceSchema.safeParse({ ...input, ...patch }).success, false);
    }
});

test('legacy category order upgrades to monthly without hiding old categories', () => {
    const legacy = ['combo', 'day_spa', 'estetica', 'depilacao', 'tantrica'];
    assert.deepEqual(categoryOrderSchema.parse(legacy), ['mensal', ...legacy]);
    assert.deepEqual(categoryOrderSchema.parse([...legacy, 'mensal']), [...legacy, 'mensal']);
    assert.equal(categoryOrderSchema.safeParse([...legacy, 'combo']).success, false);
});

test('all six offers have distinct local WebP treatment assets', () => {
    const slugs = ['combo-desacelera', 'combo-contorno-cuidado', 'combo-leveza', 'combo-recupera', 'mensal-modeladora-10-sessoes', 'mensal-sueca-4-sessoes'];
    const images = slugs.map(slug => getServiceImage(slug));
    assert.equal(new Set(images).size, 6);
    for (const image of images) {
        assert.ok(image?.endsWith('.webp'));
        assert.ok(fs.statSync(path.join(process.cwd(), 'public', image)).size > 0);
    }
});

test('all eight bronze offers have local WebP treatment assets and valid schemas', () => {
    const bronzeSlugs = [
        'bronze-gelado-lgbt',
        'bronze-gelado-masculino',
        'bronze-gelado-marquinha',
        'bronze-gelado-corpo-todo',
        'realce-bronze-jato-superior',
        'banho-de-lua-clareador',
        'descoloracao-de-pelos',
        'clareamento-de-areas'
    ];
    for (const slug of bronzeSlugs) {
        const image = getServiceImage(slug);
        assert.ok(image?.endsWith('.webp'));
        assert.ok(fs.statSync(path.join(process.cwd(), 'public', image)).size > 0);
    }
    const sampleBronze = {
        name: 'Bronze Gelado Masculino',
        category: 'bronzeamento',
        price: 200,
        duration_minutes: 45,
        description: 'Bronzeamento a jato com acabamento uniforme e sem sol.'
    };
    const parsed = createServiceSchema.parse(sampleBronze);
    assert.equal(parsed.category, 'bronzeamento');
    assert.equal(parsed.price, 200);
});
