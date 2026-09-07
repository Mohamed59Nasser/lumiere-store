-- Lumière seed data (run once)
INSERT INTO settings (key, value) VALUES
 ('storeNameAr', 'لوميير'),
 ('storeNameEn', 'Lumière'),
 ('annAr', '🚚 شحن مجاني للطلبات فوق 1500 ج.م — استبدال خلال 14 يوم'),
 ('annEn', 'Free shipping over EGP 1500 — 14-day easy returns'),
 ('shippingFee', '60'),
 ('freeShipThreshold', '1500'),
 ('walletNumber', '01159055625'),
 ('instapayNumber', '01159055625'),
 ('whatsapp', '01159055625'),
 ('phone', '01159055625'),
 ('email', 'care@lumiere.eg'),
 ('instagram', 'lumiere.eg')
ON CONFLICT (key) DO NOTHING;

INSERT INTO admins (id, name, username, password_hash) VALUES
 ('admin1', 'Mohamed Nasser', 'mohamed', '447f33dff9727a1842841aa9fdbe93b77643f92b9865df55cffd2f4aad785942')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name_ar, name_en, slug, sort) VALUES
 ('c1', 'سلاسل', 'Necklaces', 'necklaces', 1),
 ('c2', 'خواتم', 'Rings', 'rings', 2),
 ('c3', 'أقراط', 'Earrings', 'earrings', 3),
 ('c4', 'أساور', 'Bracelets', 'bracelets', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name_ar, name_en, desc_ar, desc_en, category_id, price, compare_price, main_image, images, featured, best_seller, active, created_at) VALUES
 ('p1', 'سلسلة النجمة الذهبية', 'Golden Star Necklace', 'سلسلة رفيعة بتفاصيل نجمية ناعمة — صقيل ذهبي مطلي ضد السواد، بتلبس يومية وفي المناسبات.', 'A fine chain with delicate star details — anti-tarnish gold plating, perfect for daily wear and special occasions.', 'c1', 380, NULL, '/images/necklace-gold.jpg', '["/images/necklace-gold.jpg","/images/necklace-silver.jpg"]', true, true, true, now() - interval '20 days'),
 ('p2', 'سلسلة الدانة الماسية', 'Diamond Drop Necklace', 'دانة كريستال مركزية على سلسلة سبورت أنيقة — اللمسة اللي بتكمّل أي إطلالة.', 'A central crystal drop on an elegant sport chain — the finishing touch for any look.', 'c1', 750, 950, '/images/necklace-gold.jpg', '["/images/necklace-gold.jpg"]', true, false, true, now() - interval '18 days'),
 ('p3', 'خاتم إيفي المتشابك', 'Ivy Twist Ring', 'خاتم ببن متشابك بنقشة غاردينيا — مريح على الأصبع وبيدي لمسة فخامة.', 'A twisted band ring with a gardenia motif — comfortable on the finger with a luxurious touch.', 'c2', 280, NULL, '/images/ring-gold.jpg', '["/images/ring-gold.jpg","/images/ring-silver.jpg"]', true, true, true, now() - interval '17 days'),
 ('p4', 'خاتم الملكي المضلع', 'Royal Facet Ring', 'خاتم عريض بقطع ضوئي بيحط الضوء على إيدك — قعدت مريحة من الداخل.', 'A wide faceted ring that catches the light — with a comfortable inner fit.', 'c2', 520, NULL, '/images/ring-gold.jpg', '["/images/ring-gold.jpg"]', false, false, true, now() - interval '15 days'),
 ('p5', 'أقراط الكريستال الدام', 'Crystal Drop Earrings', 'دام كريستال بلمعة متدرجة — خفيف على الأذن ومثالي للمناسبات.', 'Graduated shimmer crystal drops — light on the ear and perfect for occasions.', 'c3', 220, NULL, '/images/earrings-gold.jpg', '["/images/earrings-gold.jpg","/images/earrings-silver.jpg"]', true, true, true, now() - interval '12 days'),
 ('p6', 'أسورة النسيم', 'Breeze Bracelet', 'سلسلة أسورة مرنة بتلف على المعصم مرتين — لمسة ناعمة بتكمل أي ستايل.', 'A flexible chain bracelet that wraps twice around the wrist — a soft touch for any style.', 'c4', 420, NULL, '/images/bracelet-gold.jpg', '["/images/bracelet-gold.jpg","/images/bracelet-silver.jpg"]', true, true, true, now() - interval '10 days'),
 ('p7', 'أسورة السحر المفتوح', 'Open Charm Bracelet', 'أسورة مفتوحة بجوهر قابل للتخصيص — سهلة الارتداء على أي معصم.', 'An open bracelet with a charm accent — easy to wear on any wrist.', 'c4', 390, NULL, '/images/bracelet-gold.jpg', '["/images/bracelet-gold.jpg"]', false, false, true, now() - interval '8 days'),
 ('p8', 'أقراط الؤلؤ الكلاسيكية', 'Classic Pearl Earrings', 'لؤلؤ كلاسيكي بلمعة دافئة — القطعة اللي مالهاش وقت.', 'Classic pearls with a warm glow — a timeless piece.', 'c3', 300, NULL, '/images/earrings-silver.jpg', '["/images/earrings-silver.jpg"]', false, false, true, now() - interval '5 days');

INSERT INTO variants (id, product_id, label_ar, label_en, price, stock, image) VALUES
 ('v1', 'p1', 'ذهبي', 'Gold', 450, 15, '/images/necklace-gold.jpg'),
 ('v2', 'p1', 'فضي', 'Silver', 380, 12, '/images/necklace-silver.jpg'),
 ('v3', 'p2', 'ذهبي', 'Gold', 750, 8, '/images/necklace-gold.jpg'),
 ('v4', 'p3', 'ذهبي', 'Gold', 320, 20, '/images/ring-gold.jpg'),
 ('v5', 'p3', 'فضي', 'Silver', 280, 18, '/images/ring-silver.jpg'),
 ('v6', 'p4', 'ذهبي', 'Gold', 520, 10, '/images/ring-gold.jpg'),
 ('v7', 'p4', 'روز جولد', 'Rose Gold', 560, 8, '/images/ring-gold.jpg'),
 ('v8', 'p5', 'ذهبي', 'Gold', 260, 25, '/images/earrings-gold.jpg'),
 ('v9', 'p5', 'فضي', 'Silver', 220, 22, '/images/earrings-silver.jpg'),
 ('v10', 'p6', 'ذهبي', 'Gold', 480, 14, '/images/bracelet-gold.jpg'),
 ('v11', 'p6', 'فضي', 'Silver', 420, 14, '/images/bracelet-silver.jpg'),
 ('v12', 'p7', 'ذهبي', 'Gold', 390, 16, '/images/bracelet-gold.jpg'),
 ('v13', 'p8', 'فضي', 'Silver', 300, 20, '/images/earrings-silver.jpg');

INSERT INTO customers (id, name, email, phone, password_hash, active, created_at) VALUES
 ('u1', 'سلمى محمد', 'salma@example.com', '01012345601', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', true, now() - interval '30 days'),
 ('u2', 'نورهان علي', 'nourhan@example.com', '01098765402', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', true, now() - interval '25 days'),
 ('u3', 'ملك حسن', 'malak@example.com', '01155544303', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', true, now() - interval '14 days'),
 ('u4', 'Mohamed Nasser Fathy', 'mohamednasser555999@gmail.com', '01156426501', '447f33dff9727a1842841aa9fdbe93b77643f92b9865df55cffd2f4aad785942', true, now());

INSERT INTO coupons (id, code, type, value, min_order, active, used_count) VALUES
 ('cp1', 'WELCOME10', 'percent', 10, 500, true, 4),
 ('cp2', 'LUMIERE50', 'fixed', 50, 400, true, 2);

INSERT INTO reviews (id, product_id, customer_id, customer_name, rating, comment, created_at) VALUES
 ('r1', 'p1', 'u1', 'سلمى محمد', 5, 'السلسلة حلوة أوي والصقيل شغال معاها مية بالمية', now() - interval '12 days'),
 ('r2', 'p1', 'u2', 'نورهان علي', 4, 'خفيفة ومريحة، بس أتمنى يكون فيها مقاس أطول', now() - interval '9 days'),
 ('r3', 'p3', 'u1', 'سلمى محمد', 5, 'الخاتم شكله أغلى من سعره بكتير، توصيل كمان كان سريع', now() - interval '8 days'),
 ('r4', 'p3', 'u3', 'ملك حسن', 4, 'قعدته مريحة على الأصبع، جبت لونين', now() - interval '6 days'),
 ('r5', 'p5', 'u2', 'نورهان علي', 5, 'الأقراط لمتة حلو في المناسبات', now() - interval '4 days'),
 ('r6', 'p6', 'u3', 'ملك حسن', 4, 'أسورة عصرية ومريحة، اللون الذهبي جلاب', now() - interval '2 days');

INSERT INTO wishlist (id, customer_id, product_id, created_at) VALUES
 ('w1', 'u1', 'p2', now() - interval '3 days'),
 ('w2', 'u2', 'p7', now() - interval '2 days');

INSERT INTO orders (id, order_no, customer_id, customer_name, phone, address, city, notes, subtotal, discount, coupon_code, shipping, total, payment_method, payment_status, status, proof_image, proof_sender, created_at, updated_at) VALUES
 ('o1', 'LM-K2A10', 'u1', 'سلمى محمد', '01012345601', '15 ش محمد فريد، الدقي', 'الجيزة', '', 450, 0, NULL, 60, 510, 'cod', 'collected', 'delivered', NULL, '', now() - interval '13 days', now() - interval '10 days'),
 ('o2', 'LM-K3B21', 'u2', 'نورهان علي', '01098765402', '8 ش عباس العقاد، التجمع الخامس', 'القاهرة', 'لو سمحتي قبل المغرب', 640, 0, NULL, 60, 700, 'wallet', 'confirmed', 'delivered', '/images/banner.jpg', '01098765402', now() - interval '11 days', now() - interval '8 days'),
 ('o3', 'LM-K4C32', 'u3', 'ملك حسن', '01155544303', '22 ش فؤاد، وسط البلد', 'القاهرة', '', 680, 68, 'WELCOME10', 60, 672, 'cod', 'collected', 'delivered', NULL, '', now() - interval '9 days', now() - interval '6 days'),
 ('o4', 'LM-K5D43', 'u1', 'سلمى محمد', '01012345601', '15 ش محمد فريد، الدقي', 'الجيزة', '', 680, 0, NULL, 60, 740, 'wallet', 'confirmed', 'delivered', '/images/banner.jpg', '01012345601', now() - interval '7 days', now() - interval '5 days'),
 ('o5', 'LM-K6E54', 'u2', 'نورهان علي', '01098765402', '8 ش عباس العقاد، التجمع الخامس', 'القاهرة', '', 910, 0, NULL, 60, 970, 'cod', 'cod', 'shipping', NULL, '', now() - interval '5 days', now() - interval '1 days'),
 ('o6', 'LM-K7F65', 'u3', 'ملك حسن', '01155544303', '22 ش فؤاد، وسط البلد', 'القاهرة', 'مناسبة فرح', 750, 0, NULL, 60, 810, 'instapay', 'unconfirmed', 'preparing', '/images/banner.jpg', '01155544303', now() - interval '3 days', now() - interval '2 days'),
 ('o7', 'LM-K8G76', 'u1', 'سلمى محمد', '01012345601', '15 ش محمد فريد، الدقي', 'الجيزة', '', 700, 0, NULL, 60, 760, 'wallet', 'confirmed', 'preparing', '/images/banner.jpg', '01012345601', now() - interval '2 days', now() - interval '1 days'),
 ('o8', 'LM-K9H87', 'u2', 'نورهان علي', '01098765402', '8 ش عباس العقاد، التجمع الخامس', 'القاهرة', '', 280, 0, NULL, 60, 340, 'instapay', 'unconfirmed', 'new', '/images/banner.jpg', '01098765402', now() - interval '1 days', now() - interval '1 days'),
 ('o9', 'LM-KAJ98', 'u3', 'ملك حسن', '01155544303', '22 ش فؤاد، وسط البلد', 'القاهرة', '', 840, 84, 'WELCOME10', 60, 816, 'cod', 'cod', 'new', NULL, '', now() - interval '5 hours', now() - interval '5 hours');

INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, variant_label, price, qty, image) VALUES
 ('oi1', 'o1', 'p1', 'v1', 'سلسلة النجمة الذهبية', 'ذهبي', 450, 1, '/images/necklace-gold.jpg'),
 ('oi2', 'o2', 'p3', 'v4', 'خاتم إيفي المتشابك', 'ذهبي', 320, 2, '/images/ring-gold.jpg'),
 ('oi3', 'o3', 'p5', 'v8', 'أقراط الكريستال الدام', 'ذهبي', 260, 1, '/images/earrings-gold.jpg'),
 ('oi4', 'o3', 'p6', 'v11', 'أسورة النسيم', 'فضي', 420, 1, '/images/bracelet-silver.jpg'),
 ('oi5', 'o4', 'p1', 'v2', 'سلسلة النجمة الذهبية', 'فضي', 380, 1, '/images/necklace-silver.jpg'),
 ('oi6', 'o4', 'p8', 'v13', 'أقراط الؤلؤ الكلاسيكية', 'فضي', 300, 1, '/images/earrings-silver.jpg'),
 ('oi7', 'o5', 'p4', 'v6', 'خاتم الملكي المضلع', 'ذهبي', 520, 1, '/images/ring-gold.jpg'),
 ('oi8', 'o5', 'p7', 'v12', 'أسورة السحر المفتوح', 'ذهبي', 390, 1, '/images/bracelet-gold.jpg'),
 ('oi9', 'o6', 'p2', 'v3', 'سلسلة الدانة الماسية', 'ذهبي', 750, 1, '/images/necklace-gold.jpg'),
 ('oi10', 'o7', 'p6', 'v10', 'أسورة النسيم', 'ذهبي', 480, 1, '/images/bracelet-gold.jpg'),
 ('oi11', 'o7', 'p5', 'v9', 'أقراط الكريستال الدام', 'فضي', 220, 1, '/images/earrings-silver.jpg'),
 ('oi12', 'o8', 'p3', 'v5', 'خاتم إيفي المتشابك', 'فضي', 280, 1, '/images/ring-silver.jpg'),
 ('oi13', 'o9', 'p7', 'v12', 'أسورة السحر المفتوح', 'ذهبي', 390, 1, '/images/bracelet-gold.jpg'),
 ('oi14', 'o9', 'p1', 'v1', 'سلسلة النجمة الذهبية', 'ذهبي', 450, 1, '/images/necklace-gold.jpg');

INSERT INTO order_events (id, order_id, label, at) VALUES
 ('e1', 'o1', 'تم استلام الطلب', now() - interval '13 days'),
 ('e2', 'o1', 'قيد التجهيز', now() - interval '12 days'),
 ('e3', 'o1', 'جاري التوصيل', now() - interval '11 days'),
 ('e4', 'o1', 'تم التسليم', now() - interval '10 days'),
 ('e5', 'o2', 'تم استلام الطلب', now() - interval '11 days'),
 ('e6', 'o2', 'تم تأكيد الدفع', now() - interval '10 days'),
 ('e7', 'o2', 'قيد التجهيز', now() - interval '10 days'),
 ('e8', 'o2', 'جاري التوصيل', now() - interval '9 days'),
 ('e9', 'o2', 'تم التسليم', now() - interval '8 days'),
 ('e10', 'o3', 'تم استلام الطلب', now() - interval '9 days'),
 ('e11', 'o3', 'قيد التجهيز', now() - interval '8 days'),
 ('e12', 'o3', 'جاري التوصيل', now() - interval '7 days'),
 ('e13', 'o3', 'تم التسليم', now() - interval '6 days'),
 ('e14', 'o4', 'تم استلام الطلب', now() - interval '7 days'),
 ('e15', 'o4', 'تم تأكيد الدفع', now() - interval '6 days'),
 ('e16', 'o4', 'قيد التجهيز', now() - interval '6 days'),
 ('e17', 'o4', 'جاري التوصيل', now() - interval '5 days'),
 ('e18', 'o4', 'تم التسليم', now() - interval '5 days'),
 ('e19', 'o5', 'تم استلام الطلب', now() - interval '5 days'),
 ('e20', 'o5', 'قيد التجهيز', now() - interval '4 days'),
 ('e21', 'o5', 'جاري التوصيل', now() - interval '1 days'),
 ('e22', 'o6', 'تم استلام الطلب', now() - interval '3 days'),
 ('e23', 'o6', 'قيد التجهيز', now() - interval '2 days'),
 ('e24', 'o7', 'تم استلام الطلب', now() - interval '2 days'),
 ('e25', 'o7', 'تم تأكيد الدفع', now() - interval '1 days'),
 ('e26', 'o7', 'قيد التجهيز', now() - interval '1 days'),
 ('e27', 'o8', 'تم استلام الطلب', now() - interval '1 days'),
 ('e28', 'o9', 'تم استلام الطلب', now() - interval '5 hours');
