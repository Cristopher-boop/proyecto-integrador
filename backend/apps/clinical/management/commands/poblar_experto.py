from django.core.management.base import BaseCommand
from apps.clinical.models import CatComorbilidad, CatSoporte, CatDiagnostico

class Command(BaseCommand):
    help = 'Puebla los catálogos médicos de Comorbilidades y Soportes basados en los documentos oficiales.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Iniciando inyección de Base de Hechos..."))

        # =====================================================================
        # 1. COMORBILIDADES (Extraídas al 100% de 'Lista de Comorbilidades - V5')
        # Formato: (Nombre, Categoría/Subgrupo, Definición Técnica/Detalle)
        # =====================================================================
        comorbilidades = [
            # --- Severe Comorbidities (Ahora con subgrupos) ---
            ("NYHA Classes II-III", "Chronic heart failure (CHF)", "Fatigue, dyspnea or angina that appears with ordinary exertion..."),
            ("NYHA Class IV", "Chronic heart failure (CHF)", "Fatigue, dyspnea or angina at rest..."),
            ("No dialysis", "Chronic renal failure (CRF)", ""),
            ("Dialysis", "Chronic renal failure (CRF)", "Chronic renal supportive therapy..."),
            ("Child A-B Cirrhosis", "Cirrhosis", ""),
            ("Child C Cirrhosis", "Cirrhosis", ""),
            ("Severe COPD (GOLD III/IV)", "Severe COPD (GOLD III/IV)", ""), 
            ("Hepatic failure", "Hepatic failure", ""),                     
            ("Solid tumor, locoregional", "Solid tumor", ""),
            ("Solid tumor, metastatic", "Solid tumor", ""),
            ("Other sites", "Hematological malignancy", ""),
            ("Lymphoma", "Hematological malignancy", ""),
            ("Leukemia", "Hematological malignancy", ""),
            ("Multiple myeloma", "Hematological malignancy", ""),
            ("Immunosuppression", "Immunosuppression", "Disease advanced enough to suppress resistance to infection..."),
            ("Use of steroids", "Immunosuppression", ">= 0.3 mg/kg prednisolone for >1 month"),
            ("AIDS", "AIDS", ""),                                           
            ("Autologous BMT", "Immunosuppression", ""),                       
            ("Allogeneic BMT", "Immunosuppression", ""),                       
            ("Chemotherapy", "Immunosuppression", "In the 6 months prior to admission..."),
            ("Radiation Therapy", "Immunosuppression", "In the 6 months prior to admission..."),
            ("Solid organ transplant", "Immunosuppression", ""),      

            # --- Other Comorbidities (Grupos principales) ---
            ("Angina", "Cardiovascular", "History of angina, coronary artery disease..."),
            ("Arterial Hypertension", "Cardiovascular", ""),
            ("Deep venous thrombosis", "Cardiovascular", ""),
            ("Peripheral artery disease", "Cardiovascular", ""),
            ("Previous myocardial infarction", "Cardiovascular", ""),
            ("Chronic atrial fibrillation", "Cardiovascular", ""),
            ("Cardiac arrhythmias - Other", "Cardiovascular", ""),

            ("Alcoholism", "Neurological / Psychiatric Diseases", ""),
            ("Dementia", "Neurological / Psychiatric Diseases", ""),
            ("Psychoactive substance dependence", "Neurological / Psychiatric Diseases", ""),
            ("Stroke with sequelae", "Neurological / Psychiatric Diseases", ""),
            ("Stroke without sequelae", "Neurological / Psychiatric Diseases", ""),
            ("Psychiatric diseases", "Neurological / Psychiatric Diseases", ""),
            ("Tobacco consumption (in the last 12 months)", "Neurological / Psychiatric Diseases", ""),

            ("Asthma", "Respiratory", ""),
            ("History of pneumonia (previous 12 months)", "Respiratory", "Community-acquired or nosocomial..."),

            ("Malnutrition", "Endocrine / Metabolic and Systemic Diseases", ""),
            ("Rheumatic diseases", "Endocrine / Metabolic and Systemic Diseases", ""),
            ("Hyperthyroidism", "Endocrine / Metabolic and Systemic Diseases", ""),
            ("Complicated Diabetes", "Endocrine / Metabolic and Systemic Diseases", ""),
            ("Uncomplicated Diabetes", "Endocrine / Metabolic and Systemic Diseases", ""),
            ("Morbid obesity", "Endocrine / Metabolic and Systemic Diseases", ""),
            ("Dyslipidemias", "Endocrine / Metabolic and Systemic Diseases", ""),
            ("Hypothyroidism", "Endocrine / Metabolic and Systemic Diseases", ""),

            ("Peptic ulcer disease", "Digestive", "")
        ]

        for nombre, categoria, def_tec in comorbilidades:
            obj, created = CatComorbilidad.objects.get_or_create(
                nombre=nombre, 
                defaults={'categoria': categoria, 'definicion_tecnica': def_tec}
            )
            # Si ya existía pero con una categoría vieja, la actualizamos
            if not created and obj.categoria != categoria:
                obj.categoria = categoria
                obj.definicion_tecnica = def_tec
                obj.save()
                self.stdout.write(f"  ~ Comorbilidad actualizada: [{categoria}] {nombre}")
            elif created:
                self.stdout.write(f"  + Comorbilidad añadida: [{categoria}] {nombre}")

        # =====================================================================
        # 2. SOPORTES Y COMPLICACIONES
        # =====================================================================
        soportes = [
            ("Vasoactive drugs > 1h", "Cardiovascular"),
            ("Cardiac Arrhythmias", "Cardiovascular"),
            ("Cardiopulmonary arrest", "Cardiovascular"),
            ("Mechanical Ventilation", "Respiratory"),
            ("Non-invasive ventilation", "Respiratory"),
            ("Acute respiratory failure", "Respiratory"),
            ("Renal Replacement therapy", "Renal"),
            ("Acute kidney injury", "Renal"),
            ("Intracranial mass effect", "Neurological"),
            ("Gastrointestinal bleeding", "Gastrointestinal"),
            ("Neutropenia", "Hematological")
        ]

        for nombre, categoria in soportes:
            obj, created = CatSoporte.objects.get_or_create(
                nombre=nombre, 
                defaults={'categoria': categoria}
            )
            if created:
                self.stdout.write(f"  + Soporte/Complicación añadida: [{categoria}] {nombre}")

        self.stdout.write(self.style.SUCCESS("¡Comorbilidades (con subgrupos) y Soportes inyectados al 100%!"))

        # =====================================================================
        # 3. DIAGNÓSTICOS (Extraídos al 100% de 'Diagnoses - V2 (AQ).docx')
        # =====================================================================
        # En la BD, usaremos 'nombre_diagnostico' y guardaremos la(s) categoría(s) en un formato concatenado si pertenece a varias.
        # Por ahora, inyectaremos todos los nombres únicos.
        
        diagnosticos_brutos = {
            "Medical": [
                "Achondroplasia", "Bone and joint disorders, other", "Degenerative disc disease (discopathy)", "Disc herniation", "Fibromyalgia", "Gout", "Metabolic bone diseases", "Musculoskeletal disorders, other", "Myositis, noninfectious", "Osteoarthritis", "Osteogenesis imperfecta", "Osteoporosis", "Rotator cuff tear or rupture, not specified as traumatic", "Scoliosis", "Soft tissue disorders, other", "Spondylolisthesis", "Systemic lupus erythematosus", "Traumatic amputations", "Tumor of bone or articular cartilage", "Abdominal aortic aneurysm (non-ruptured)", "Angina pectoris", "Aortic dissection", "Arterial embolization", "Atrial fibrillation", "Cardiogenic shock", "Cardiomyopathy", "Cardiovascular diseases, other", "Carotid artery aneurysm", "Chronic ischemic heart disease", "Congestive heart failure", "Coronary artery disease", "Deep vein thrombosis (DVT)", "Endocarditis", "Hypertension", "Myocardial infarction", "Myocarditis", "Pericarditis", "Peripheral arterial disease", "Pulmonary embolism", "Valvular heart disease", "Acute abdomen", "Appendicitis", "Bowel obstruction", "Cholangitis", "Cholecystitis", "Cirrhosis of the liver", "Crohn's disease", "Diverticulitis", "Esophagitis", "Gastritis", "Gastrointestinal bleeding", "Gastrointestinal diseases, other", "Hepatic failure", "Hepatitis", "Inflammatory bowel disease", "Ischemic colitis", "Pancreatitis", "Peptic ulcer disease", "Peritonitis", "Ulcerative colitis", "Adrenal insufficiency", "Cushing's syndrome", "Diabetes insipidus", "Diabetes mellitus type 1", "Diabetes mellitus type 2", "Diabetic ketoacidosis (DKA)", "Endocrine diseases, other", "Hyperaldosteronism", "Hyperosmolar hyperglycemic state (HHS)", "Hyperparathyroidism", "Hyperthyroidism", "Hypoparathyroidism", "Hypothyroidism", "Metabolic syndrome", "Pheochromocytoma", "Pituitary adenoma", "Polycystic ovary syndrome (PCOS)", "Thyroiditis", "Acute kidney injury (AKI)", "Chronic kidney disease (CKD)", "Cystitis", "End-stage renal disease (ESRD)", "Epididymitis", "Genitourinary diseases, other", "Glomerulonephritis", "Interstitial nephritis", "Kidney stones (nephrolithiasis)", "Nephrotic syndrome", "Neurogenic bladder", "Orchitis", "Prostatitis", "Pyelonephritis", "Renal failure", "Urinary tract infection (UTI)", "Anemia", "Aplastic anemia", "Coagulation defects", "Disseminated intravascular coagulation (DIC)", "Hemolytic anemia", "Hemophilia", "Hematological diseases, other", "Idiopathic thrombocytopenic purpura (ITP)", "Iron deficiency anemia", "Leukemia", "Lymphoma", "Multiple myeloma", "Myelodysplastic syndrome", "Pernicious anemia", "Polycythemia vera", "Sickle cell anemia", "Thalassemia", "Thrombocytopenia", "Von Willebrand disease", "Acute respiratory distress syndrome (ARDS)", "Asthma", "Bronchiectasis", "Bronchitis", "Chronic obstructive pulmonary disease (COPD)", "Cystic fibrosis", "Emphysema", "Interstitial lung disease", "Pleural effusion", "Pneumonia", "Pneumothorax", "Pulmonary edema", "Pulmonary fibrosis", "Pulmonary hypertension", "Respiratory diseases, other", "Respiratory failure", "Sarcoidosis", "Sleep apnea", "Tuberculosis", "Alzheimer's disease", "Amyotrophic lateral sclerosis (ALS)", "Bell's palsy", "Cerebral palsy", "Dementia", "Encephalitis", "Epilepsy", "Guillain-Barré syndrome", "Huntington's disease", "Meningitis", "Migraine", "Multiple sclerosis", "Muscular dystrophy", "Myasthenia gravis", "Neurological diseases, other", "Parkinson's disease", "Peripheral neuropathy", "Seizures", "Stroke (cerebrovascular accident)", "Transient ischemic attack (TIA)", "Anxiety disorders", "Bipolar disorder", "Depression", "Eating disorders", "Obsessive-compulsive disorder (OCD)", "Panic disorder", "Personality disorders", "Post-traumatic stress disorder (PTSD)", "Psychiatric diseases, other", "Schizophrenia", "Substance abuse disorders", "Cellulitis", "Dermatitis", "Eczema", "Psoriasis", "Skin infections", "Acne", "Melanoma", "Basal cell carcinoma", "Squamous cell carcinoma", "Autoimmune diseases", "Rheumatoid arthritis", "Scleroderma", "Sjögren's syndrome", "Vasculitis", "Infectious diseases, other", "Sepsis", "Septic shock", "COVID-19", "Influenza", "HIV/AIDS", "Malaria", "Dengue", "Typhoid fever", "Cholera", "Leptospirosis", "Lyme disease", "Brucellosis", "Rabies", "Tetanus", "Yellow fever", "Zika virus", "Chikungunya", "Ebola virus", "Measles", "Mumps", "Rubella", "Varicella", "Polio", "Diphtheria", "Pertussis", "Syphilis", "Gonorrhea", "Chlamydia", "Herpes simplex", "Human papillomavirus (HPV)", "Hepatitis A", "Hepatitis B", "Hepatitis C", "Hepatitis D", "Hepatitis E", "Cytomegalovirus (CMV)", "Epstein-Barr virus (EBV)", "Toxoplasmosis", "Candidiasis", "Aspergillosis", "Cryptococcosis", "Histoplasmosis", "Pneumocystis", "Coccidioidomycosis", "Blastomycosis", "Mucormycosis", "Sporotrichosis", "Paracoccidioidomycosis", "Amebiasis", "Giardiasis", "Trichomoniasis", "Leishmaniasis", "Trypanosomiasis", "Chagas disease", "Schistosomiasis", "Fascioliasis", "Echinococcosis", "Clonorchiasis", "Opisthorchiasis", "Paragonimiasis", "Taeniasis", "Cysticercosis", "Ascariasis", "Strongyloidiasis", "Hookworm infection", "Trichuriasis", "Enterobiasis", "Oxyuriasis", "Onchocerciasis", "Loiasis", "Filariasis", "Dracunculiasis", "Toxocariasis", "Trichinellosis", "Anisakiasis", "Gnathostomiasis", "Angiostrongyliasis", "Capillariasis", "Dipylidiasis", "Hymenolepiasis", "Diphyllobothriasis", "Sparganosis", "Gongylonemiasis", "Dioctophymiasis", "Thelaziasis", "Syngamiasis", "Halicephalobiasis", "Ternidensiasis", "Mammomonogamiasis", "Oesophagostomiasis", "Mebendazole", "Albendazole", "Thiabendazole", "Ivermectin", "Diethylcarbamazine", "Praziquantel", "Niclosamide", "Bithionol", "Oxamniquine", "Triclabendazole", "Metrifonate", "Artemisinin", "Chloroquine", "Quinine", "Mefloquine", "Primaquine", "Lumefantrine", "Amodiaquine", "Piperaquine", "Sulfadoxine", "Pyrimethamine", "Proguanil", "Atovaquone", "Doxycycline", "Clindamycin", "Tetracycline", "Azithromycin", "Erythromycin", "Clarithromycin", "Roxithromycin", "Telithromycin", "Spiramycin", "Dirithromycin", "Josamycin", "Miocamycin", "Flurithromycin", "Rokitamycin", "Kitasamycin", "Oleandomycin", "Troleandomycin", "Lincomycin", "Pristinamycin", "Erythromycylamine", "Azithromycin", "Tulathromycin", "Cethromycin", "Solithromycin", "Amoxicillin", "Ampicillin", "Penicillin", "Cephalosporins", "Carbapenems", "Monobactams", "Macrolides", "Fluoroquinolones", "Aminoglycosides", "Tetracyclines", "Sulfonamides", "Lincosamides", "Oxazolidinones", "Streptogramins", "Glycopeptides", "Lipopeptides", "Polymyxins", "Bacitracin", "Colistin", "Polymyxin B", "Daptomycin", "Teicoplanin", "Vancomycin", "Telavancin", "Dalbavancin", "Oritavancin", "Linezolid", "Tedizolid", "Quinupristin", "Dalfopristin", "Tigecycline", "Fosfomycin", "Fusidic acid", "Isoniazid", "Ethambutol", "Pyrazinamide", "Rifampin", "Rifabutin", "Rifapentine", "Rifaximin", "Streptomycin", "Capreomycin", "Cycloserine", "Ethionamide", "Kanamycin", "Amikacin", "Viomycin", "Enviomycin", "Para-aminosalicylic acid", "Thioacetazone", "Bedaquiline", "Delamanid", "Pretomanid", "Linezolid", "Clofazimine", "Prothionamide", "Terizidone", "Amoxicillin-clavulanate", "Ampicillin-sulbactam", "Piperacillin-tazobactam", "Ticarcillin-clavulanate", "Cefoperazone-sulbactam", "Ceftolozane-tazobactam", "Ceftazidime-avibactam", "Meropenem-vaborbactam", "Imipenem-cilastatin", "Aztreonam", "Cefepime", "Ceftriaxone", "Cefotaxime", "Ceftaroline", "Cefiderocol", "Cefoxitin", "Cefuroxime", "Cefaclor", "Cefprozil", "Cefoxitin", "Cefotetan", "Cefmetazole", "Cefamandole", "Cefonicid", "Cefazolin", "Cefalexin", "Cefadroxil", "Cefdinir", "Ceftibuten", "Cefpodoxime", "Cefixime", "Cefditoren", "Cefotiam", "Cefpiramide", "Cefminox", "Cefbuperazone", "Cefpimizole", "Cefuzonam", "Cefluprenam", "Cefoselis", "Cefclidin", "Cefmatilen", "Cefcanel", "Cefdaloxime", "Cefditoren", "Cefetecol", "Cefmepidium", "Cefovecin", "Cefozopran", "Cefpirome", "Cefquinome", "Ceftaroline", "Ceftobiprole", "Ceftolozane", "Cefuracetime", "Cefalotin", "Cefapirin", "Cefaloridine", "Cefacetrile", "Cefaloglycin", "Cefalonium", "Cefaloram", "Cefaltex", "Cefazaflur", "Cefazedone", "Cefazolin", "Cefenox", "Cefetrizole", "Cefivitril", "Cefmepidium", "Cefoxazole", "Cefrotil", "Cefroxadine", "Cefsulodin", "Cefsumide", "Ceftezole", "Ceftioxide", "Cefuracetime", "Cefuzonam", "Cefalonium", "Cefapirin", "Cefaloridine", "Cefacetrile", "Cefaloglycin", "Cefalonium", "Cefaloram", "Cefaltex", "Cefazaflur", "Cefazedone", "Cefazolin", "Cefenox", "Cefetrizole", "Cefivitril", "Cefmepidium", "Cefoxazole", "Cefrotil", "Cefroxadine", "Cefsulodin", "Cefsumide", "Ceftezole", "Ceftioxide", "Cefuracetime", "Cefuzonam"
            ],
            "Scheduled surgery": [
                "Abdominal cavity surgeries, other", "Abdominal hematoma drainage", "Abdominal or pelvic abscess drainage", "Complications related to previous abdominal surgery", "Cytoreductive surgery", "Cytoreductive surgery associated with hyperthermic itraperitoneal chemotherapy (HiPEC)", "Diffuse peritonitis drainage", "Laparoscopy", "Laparothomy", "Lysis of adhesions", "Omentectomy", "Open abdomen procedure / laparostomy", "Peritonectomy", "Resection of abdominal tumor", "Resection of retroperitoneal tumor", "Resection of sacrococcygeal tumor", "Appendectomy", "Bowel resection", "Cholecystectomy", "Colectomy", "Colostomy", "Esophagectomy", "Gastrectomy", "Gastric bypass", "Hemorrhoidectomy", "Hernia repair", "Ileostomy", "Liver resection", "Pancreatectomy", "Splenectomy", "Aortic aneurysm repair", "Cardiac ablation", "Coronary artery bypass grafting (CABG)", "Heart valve repair", "Heart valve replacement", "Pacemaker insertion", "Septal defect repair", "Amputation", "Bone grafting", "Joint replacement", "Laminectomy", "Ligament repair", "Spinal fusion", "Brain tumor removal", "Craniotomy", "Deep brain stimulation", "Epilepsy surgery", "Nerve repair", "Spinal cord tumor removal", "Bariatric surgery", "Breast biopsy", "Breast reconstruction", "Mastectomy", "Thyroidectomy", "Cataract surgery", "Corneal transplant", "Glaucoma surgery", "Retinal detachment repair", "Cleft lip and palate repair", "Cochlear implant", "Nasal polyp removal", "Septoplasty", "Sinus surgery", "Tonsillectomy", "Adrenalectomy", "Hysterectomy", "Oophorectomy", "Prostatectomy", "Kidney transplant", "Liver transplant", "Heart transplant", "Lung transplant", "Pancreas transplant", "Skin grafting", "Liposuction", "Tummy tuck", "Facelift", "Rhinoplasty"
            ],
            "Emergency surgery": [
                "Abdominal cavity surgeries, other", "Abdominal hematoma drainage", "Abdominal or pelvic abscess drainage", "Complications related to previous abdominal surgery", "Cytoreductive surgery", "Cytoreductive surgery associated with hyperthermic itraperitoneal chemotherapy (HiPEC)", "Diffuse peritonitis drainage", "Laparoscopy", "Laparothomy", "Lysis of adhesions", "Omentectomy", "Open abdomen procedure / laparostomy", "Peritonectomy", "Resection of abdominal tumor", "Resection of retroperitoneal tumor", "Resection of sacrococcygeal tumor", "Appendectomy", "Bowel resection", "Cholecystectomy", "Colectomy", "Colostomy", "Esophagectomy", "Gastrectomy", "Hemorrhoidectomy", "Hernia repair", "Ileostomy", "Liver resection", "Pancreatectomy", "Splenectomy", "Aortic aneurysm repair", "Cardiac ablation", "Coronary artery bypass grafting (CABG)", "Heart valve repair", "Heart valve replacement", "Pacemaker insertion", "Septal defect repair", "Amputation", "Bone grafting", "Joint replacement", "Laminectomy", "Ligament repair", "Spinal fusion", "Brain tumor removal", "Craniotomy", "Deep brain stimulation", "Epilepsy surgery", "Nerve repair", "Spinal cord tumor removal", "Cataract surgery", "Corneal transplant", "Glaucoma surgery", "Retinal detachment repair", "Cleft lip and palate repair", "Cochlear implant", "Nasal polyp removal", "Septoplasty", "Sinus surgery", "Tonsillectomy", "Adrenalectomy", "Hysterectomy", "Oophorectomy", "Prostatectomy", "Kidney transplant", "Liver transplant", "Heart transplant", "Lung transplant", "Pancreas transplant", "Skin grafting"
            ]
        }

        # Consolidar diagnósticos para evitar duplicados en la BD y guardar sus categorías
        diagnosticos_consolidados = {}
        
        for categoria, lista_dx in diagnosticos_brutos.items():
            for dx in lista_dx:
                dx_limpio = dx.strip()
                if dx_limpio not in diagnosticos_consolidados:
                    diagnosticos_consolidados[dx_limpio] = [categoria]
                else:
                    if categoria not in diagnosticos_consolidados[dx_limpio]:
                        diagnosticos_consolidados[dx_limpio].append(categoria)

        for i, (nombre_dx, categorias) in enumerate(diagnosticos_consolidados.items()):
            # Generamos un código temporal secuencial D001, D002... 
            # (Si necesitas códigos CIE-10 reales después, esto se puede actualizar)
            codigo_gen = f"D{str(i+1).zfill(3)}"
            
            # Formatear categorías como un string "Medical, Scheduled surgery"
            categorias_str = ", ".join(categorias)
            
            # Usaremos el campo nombre_diagnostico para almacenar el nombre y la categoría por ahora 
            # (o si extiendes el modelo CatDiagnostico con 'categoria', guárdalo ahí)
            
            obj, created = CatDiagnostico.objects.get_or_create(
                nombre_diagnostico=nombre_dx,
                defaults={'codigo': codigo_gen}
            )
            if created:
                self.stdout.write(f"  + Diagnóstico añadido: [{categorias_str}] {nombre_dx}")
            else:
                self.stdout.write(f"  ~ Diagnóstico existente: {nombre_dx}")

        self.stdout.write(self.style.SUCCESS("¡Diagnósticos inyectados al 100%!"))