/*
# Expand Chilean tariff catalog

1. Plain-English explanation
- Adds representative tariff-line records from the Chilean customs tariff information supplied for TradeLearn.
- Keeps the existing public tariff-search structure so the current search screen can display the new records without a redesign.

2. Modified table
- `public.tariff_items`
- Adds no columns and changes no existing records.
- Inserts tariff code, Spanish description, NMF tariff rate, TLC summary, and unit of measure.

3. Security
- Uses the existing public read policy on `tariff_items`.
- No public write policy is added; catalog writes remain restricted to migration/service-role operations.

4. Important notes
- Inserts are idempotent through `ON CONFLICT (code) DO NOTHING`.
- Codes are stored using the searcher's existing dotted format (for example `0101.21.00`).
*/

INSERT INTO public.tariff_items (code, description, rate, tlcs, unit_measure) VALUES
('0101.21.00', 'Caballos reproductores de raza pura', 6, '0% (TLC aplicables)', 'U'),
('0101.29.10', 'Caballos de carrera', 6, '0% (TLC aplicables)', 'U'),
('0101.29.90', 'Los demás caballos', 6, '0% (TLC aplicables)', 'U'),
('0101.30.00', 'Asnos vivos', 6, '0% (TLC aplicables)', 'U'),
('0102.21.00', 'Bovinos reproductores de raza pura', 6, '0% (TLC aplicables)', 'U'),
('0102.29.00', 'Los demás bovinos domésticos', 6, '0% (TLC aplicables)', 'U'),
('0103.10.00', 'Porcinos reproductores de raza pura', 6, '0% (TLC aplicables)', 'U'),
('0103.91.00', 'Porcinos de peso inferior a 50 kg', 6, '0% (TLC aplicables)', 'U'),
('0104.10.10', 'Ovinos reproductores de raza pura', 6, '0% (TLC aplicables)', 'U'),
('0105.11.10', 'Aves de la especie Gallus domesticus, reproductores', 6, '0% (TLC aplicables)', 'U'),
('0106.13.10', 'Guanacos vivos (Lama guanicoe)', 6, '0% (TLC aplicables)', 'U'),
('0106.19.20', 'Pudúes vivos (Pudu puda)', 6, '0% (TLC aplicables)', 'U'),
('0106.90.10', 'Rana chilena (Calyptocephalella gayi o Caudiverbera caudiverbera)', 6, '0% (TLC aplicables)', 'U'),
('0201.10.00', 'Carne bovina en canales o medias canales, fresca o refrigerada', 6, '0% (TLC aplicables)', 'KB'),
('0201.20.10', 'Carne bovina, cuartos traseros sin deshuesar', 6, '0% (TLC aplicables)', 'KB'),
('0201.30.10', 'Carne bovina deshuesada, filete', 6, '0% (TLC aplicables)', 'KB'),
('0201.30.20', 'Carne bovina deshuesada, lomo', 6, '0% (TLC aplicables)', 'KB'),
('0202.10.00', 'Carne bovina congelada, en canales o medias canales', 6, '0% (TLC aplicables)', 'KB'),
('0203.11.00', 'Carne porcina fresca o refrigerada, en canales o medias canales', 6, '0% (TLC aplicables)', 'KB'),
('0203.22.10', 'Carne porcina congelada, piernas', 6, '0% (TLC aplicables)', 'KB'),
('0204.50.00', 'Carne de animales de la especie caprina', 6, '0% (TLC aplicables)', 'KB'),
('0207.14.11', 'Carne de pollo congelada, trozos deshuesados, pechugas', 6, '0% (TLC aplicables)', 'KB'),
('0208.60.10', 'Carne de guanaco congelada', 6, '0% (TLC aplicables)', 'KB'),
('0210.11.00', 'Jamones, paletas y trozos de cerdo, salados o secos', 6, '0% (TLC aplicables)', 'KB'),
('0301.11.00', 'Peces ornamentales de agua dulce', 6, '0% (TLC aplicables)', 'KB'),
('0301.91.00', 'Truchas vivas', 6, '0% (TLC aplicables)', 'KB'),
('0302.11.10', 'Truchas enteras, frescas o refrigeradas', 6, '0% (TLC aplicables)', 'KB'),
('0302.45.11', 'Jureles chilenos enteros, frescos o refrigerados', 6, '0% (TLC aplicables)', 'KB'),
('0302.54.13', 'Merluzas del sur enteras, frescas o refrigeradas', 6, '0% (TLC aplicables)', 'KB'),
('0303.14.10', 'Truchas enteras congeladas', 6, '0% (TLC aplicables)', 'KB'),
('0304.44.10', 'Filetes frescos o refrigerados de merluzas comunes', 6, '0% (TLC aplicables)', 'KB'),
('0306.14.21', 'Centollas congeladas (Lithodes santolla)', 6, '0% (TLC aplicables)', 'KB'),
('0306.17.11', 'Camarones nailon congelados (Heterocarpus reedi)', 6, '0% (TLC aplicables)', 'KB'),
('0307.21.10', 'Ostiones del Norte vivos, frescos o refrigerados', 6, '0% (TLC aplicables)', 'KB'),
('0307.91.30', 'Locos vivos, frescos o refrigerados', 6, '0% (TLC aplicables)', 'KB'),
('0401.10.00', 'Leche y nata con materias grasas inferior o igual al 1%', 6, '0% (TLC aplicables)', 'HL'),
('0402.21.18', 'Leche en polvo con materias grasas superior o igual al 26%', 6, '0% (TLC aplicables)', 'KB'),
('0406.10.30', 'Mozzarella fresca', 6, '0% (TLC aplicables)', 'KB'),
('0409.00.10', 'Miel natural orgánica', 6, '0% (TLC aplicables)', 'KB'),
('0511.10.00', 'Semen de bovino', 6, '0% (TLC aplicables)', 'KB'),
('1501.10.00', 'Manteca de cerdo', 6, '0% (TLC aplicables)', 'KB'),
('1504.20.10', 'Aceite de pescado crudo', 6, '0% (TLC aplicables)', 'KB'),
('1507.10.00', 'Aceite de soja en bruto, incluso desgomado', 6, '0% (TLC aplicables)', 'KB'),
('1509.20.11', 'Aceite de oliva virgen extra orgánico en envases de hasta 5 l', 6, '0% (TLC aplicables)', 'KB'),
('1515.90.10', 'Aceite de mosqueta (Rosa rubiginosa)', 6, '0% (TLC aplicables)', 'KB'),
('1601.00.00', 'Embutidos y productos similares de carne', 6, '0% (TLC aplicables)', 'KB'),
('1604.19.11', 'Jurel preparado o conservado al natural', 6, '0% (TLC aplicables)', 'KB'),
('1605.21.11', 'Camarón nailon preparado o conservado', 6, '0% (TLC aplicables)', 'KB'),
('1701.99.10', 'Azúcar de caña refinada', 6, '0% (TLC aplicables)', 'KB'),
('1801.00.00', 'Cacao en grano, entero o partido', 6, '0% (TLC aplicables)', 'KB'),
('1806.31.00', 'Chocolate en bloques, tabletas o barras, relleno', 6, '0% (TLC aplicables)', 'KB'),
('1902.11.00', 'Pastas alimenticias que contengan huevo', 6, '0% (TLC aplicables)', 'KB'),
('1905.31.00', 'Galletas dulces con adición de edulcorante', 6, '0% (TLC aplicables)', 'KB'),
('2008.80.00', 'Frutillas preparadas o conservadas', 6, '0% (TLC aplicables)', 'KB'),
('2009.89.10', 'Jugo de mora', 6, '0% (TLC aplicables)', 'KB'),
('2103.20.10', 'Kétchup y demás salsas de tomate', 6, '0% (TLC aplicables)', 'KB'),
('2203.00.00', 'Cerveza de malta', 6, '0% (TLC aplicables)', 'KB'),
('2204.21.31', 'Vino blanco con denominación de origen, Sauvignon blanc', 6, '0% (TLC aplicables)', 'HL'),
('2204.21.51', 'Vino tinto con denominación de origen, Cabernet sauvignon', 6, '0% (TLC aplicables)', 'HL'),
('2208.40.10', 'Ron', 6, '0% (TLC aplicables)', 'KB'),
('2301.20.11', 'Harina de pescado con proteína inferior al 66%', 6, '0% (TLC aplicables)', 'KB'),
('2309.10.00', 'Alimentos para perros o gatos para venta al por menor', 6, '0% (TLC aplicables)', 'KB'),
('2501.00.20', 'Sal gema, sal de salinas y sal marina', 6, '0% (TLC aplicables)', 'KB'),
('2603.00.00', 'Minerales de cobre y sus concentrados', 6, '0% (TLC aplicables)', 'QMB'),
('2613.10.10', 'Concentrados tostados de molibdeno', 6, '0% (TLC aplicables)', 'QMB'),
('2709.00.10', 'Aceites crudos de petróleo con grados API inferior a 25', 6, '0% (TLC aplicables)', 'TMB'),
('2710.12.22', 'Gasolina sin plomo de 93 octanos', 6, '0% (TLC aplicables)', 'KB'),
('2711.12.00', 'Propano licuado', 6, '0% (TLC aplicables)', 'QMN'),
('3901.10.10', 'Polietileno de alta presión', 6, '0% (TLC aplicables)', 'KB'),
('3902.10.00', 'Polipropileno en formas primarias', 6, '0% (TLC aplicables)', 'KB'),
('3907.61.00', 'Poli(tereftalato de etileno) con índice de viscosidad superior o igual a 78 ml/g', 6, '0% (TLC aplicables)', 'KB'),
('3923.30.10', 'Botellas y frascos de plástico', 6, '0% (TLC aplicables)', 'KB'),
('4011.10.00', 'Neumáticos nuevos para automóviles de turismo', 6, '0% (TLC aplicables)', 'KB'),
('4103.90.10', 'Cueros y pieles en bruto de guanaco', 6, '0% (TLC aplicables)', 'KB'),
('4202.21.00', 'Bolsos de mano con superficie exterior de cuero natural', 6, '0% (TLC aplicables)', 'KB'),
('4301.80.10', 'Pieles en bruto de guanaco', 6, '0% (TLC aplicables)', 'KB'),
('4401.21.10', 'Madera en plaquitas de pino radiata', 6, '0% (TLC aplicables)', 'QMB'),
('4407.11.12', 'Madera simplemente aserrada de pino insigne', 6, '0% (TLC aplicables)', 'MCUB'),
('4415.10.00', 'Cajones, cajas y envases similares de madera', 6, '0% (TLC aplicables)', 'KB'),
('4801.00.10', 'Papel prensa en bobinas', 6, '0% (TLC aplicables)', 'KB'),
('4819.10.10', 'Cajas de cartón corrugado', 6, '0% (TLC aplicables)', 'KB'),
('4901.99.11', 'Libros escolares para enseñanza básica y media', 6, '0% (TLC aplicables)', 'KB'),
('5001.00.00', 'Capullos de seda aptos para el devanado', 6, '0% (TLC aplicables)', 'KL'),
('5102.19.10', 'Pelo fino de guanaco', 6, '0% (TLC aplicables)', 'KB'),
('5201.00.00', 'Algodón sin cardar ni peinar', 6, '0% (TLC aplicables)', 'KB'),
('5402.20.00', 'Hilados de alta tenacidad de poliésteres', 6, '0% (TLC aplicables)', 'KB'),
('5503.20.00', 'Fibras sintéticas discontinuas de poliésteres', 6, '0% (TLC aplicables)', 'KB'),
('5603.11.10', 'Tela sin tejer de filamentos sintéticos, impregnada', 6, '0% (TLC aplicables)', 'KB'),
('6109.10.00', 'Camisetas y poleras de algodón, de punto', 6, '0% (TLC aplicables)', 'KN'),
('6203.42.10', 'Pantalones de mezclilla para hombres o niños', 6, '0% (TLC aplicables)', 'KN'),
('6403.99.90', 'Los demás calzados con parte superior de cuero natural', 6, '0% (TLC aplicables)', 'PAR'),
('6506.10.00', 'Cascos de seguridad', 6, '0% (TLC aplicables)', 'KL'),
('6802.21.00', 'Piedras de talla de mármol, travertinos y alabastro', 6, '0% (TLC aplicables)', 'KB'),
('6907.21.10', 'Baldosas cerámicas de gres con baja absorción de agua', 6, '0% (TLC aplicables)', 'KB'),
('7010.90.20', 'Botellas para bebidas de vidrio de más de 0,33 l hasta 1 l', 6, '0% (TLC aplicables)', 'KB'),
('7108.12.11', 'Lingotes de oro minero obtenidos mediante electrorefinación', 6, '0% (TLC aplicables)', 'GN'),
('7113.11.00', 'Artículos de joyería de plata', 6, '0% (TLC aplicables)', 'GN'),
('8471.30.40', 'Computadoras portátiles tipo notebook o laptop', 6, '0% (TLC aplicables)', 'KB'),
('8414.51.00', 'Ventiladores de mesa, suelo, pared, cielo raso o techo', 6, '0% (TLC aplicables)', 'KB'),
('8517.13.00', 'Teléfonos inteligentes', 6, '0% (TLC aplicables)', 'KB'),
('8507.60.00', 'Acumuladores eléctricos de iones de litio', 6, '0% (TLC aplicables)', 'KB'),
('8541.42.00', 'Células fotovoltaicas sin ensamblar en módulos o paneles', 6, '0% (TLC aplicables)', 'KL'),
('9004.10.90', 'Gafas de sol, las demás', 6, '0% (TLC aplicables)', 'KL'),
('9018.31.11', 'Jeringas de plástico desechables con aguja fija', 6, '0% (TLC aplicables)', 'KL'),
('9021.50.10', 'Marcapasos', 6, '0% (TLC aplicables)', 'KL'),
('9102.11.00', 'Relojes de pulsera eléctricos con indicador mecánico', 6, '0% (TLC aplicables)', 'c/u'),
('9202.90.20', 'Instrumentos musicales de cuerda, los demás', 6, '0% (TLC aplicables)', 'c/u'),
('9304.00.10', 'Armas de aire comprimido o gas', 6, '0% (TLC aplicables)', 'KL'),
('9403.30.10', 'Escritorios de madera para oficina', 6, '0% (TLC aplicables)', 'KB'),
('9504.50.00', 'Videoconsolas y máquinas de videojuego', 6, '0% (TLC aplicables)', 'KL'),
('9603.21.00', 'Cepillos de dientes', 6, '0% (TLC aplicables)', 'KL'),
('9701.91.00', 'Pinturas y dibujos originales', 6, '0% (TLC aplicables)', 'KB')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS tariff_items_description_search_idx
  ON public.tariff_items USING gin (to_tsvector('spanish', description));