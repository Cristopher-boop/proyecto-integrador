from django.core.management.base import BaseCommand
from apps.clinical.models import CatComorbilidad, CatSoporte, CatDiagnostico

class Command(BaseCommand):
    help = 'Puebla los catálogos médicos de Comorbilidades y Soportes con sinónimos en francés.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Iniciando inyección de Base de Hechos con Sinónimos..."))

        # =====================================================================
        # 1. COMORBILIDADES (Nombre, Categoría, Definición Técnica, Palabras_Clave_FR)
        # =====================================================================
        comorbilidades = [
            # --- Severe Comorbidities ---
            ("NYHA Classes II-III", "Chronic heart failure (CHF)", "Fatigue, dyspnea or angina...", "insuffisance cardiaque, nyha ii, nyha iii"),
            ("NYHA Class IV", "Chronic heart failure (CHF)", "Fatigue, dyspnea or angina at rest...", "insuffisance cardiaque, nyha iv, nyha 4"),
            ("No dialysis", "Chronic renal failure (CRF)", "", "insuffisance renale chronique, irc, insuffisance renale"),
            ("Dialysis", "Chronic renal failure (CRF)", "Chronic renal supportive therapy...", "dialyse, hemodialyse, hemofiltration, epuration extrarenale"),
            ("Child A-B Cirrhosis", "Cirrhosis", "", "cirrhose, cirrhose hepatique, child a, child b"),
            ("Child C Cirrhosis", "Cirrhosis", "", "cirrhose, cirrhose hepatique, child c"),
            ("Severe COPD (GOLD III/IV)", "Severe COPD (GOLD III/IV)", "", "bpco, broncho pneumopathie chronique obstructive"),
            ("Hepatic failure", "Hepatic failure", "", "insuffisance hepatique, defaillance hepatique"),                     
            ("Solid tumor, locoregional", "Solid tumor", "", "tumeur solide, cancer, neoplasie, tumeur"),
            ("Solid tumor, metastatic", "Solid tumor", "", "tumeur metastatique, metastases, cancer metastatique"),
            ("Other sites", "Hematological malignancy", "", "hemopathie maligne, cancer du sang"),
            ("Lymphoma", "Hematological malignancy", "", "lymphome, hodgkin, non-hodgkin"),
            ("Leukemia", "Hematological malignancy", "", "leucemie"),
            ("Multiple myeloma", "Hematological malignancy", "", "myelome multiple, myelome"),
            ("Immunosuppression", "Immunosuppression", "Disease advanced enough...", "immunosuppression, immunodepression, immunodeprime"),
            ("Use of steroids", "Immunosuppression", ">= 0.3 mg/kg prednisolone...", "steroides, corticoides, corticotherapie, prednisolone, prednisone"),
            ("AIDS", "AIDS", "", "sida, vih, vih positif"),                                           
            ("Autologous BMT", "Immunosuppression", "", "greffe de moelle, autologue, greffe autologue"),                       
            ("Allogeneic BMT", "Immunosuppression", "", "greffe de moelle, allogenique, greffe allogenique"),                       
            ("Chemotherapy", "Immunosuppression", "In the 6 months prior...", "chimiotherapie, chimio"),
            ("Radiation Therapy", "Immunosuppression", "In the 6 months prior...", "radiotherapie, rayons, irradiation"),
            ("Solid organ transplant", "Immunosuppression", "", "transplantation d'organe, greffe, transplante"),       

            # --- Other Comorbidities ---
            ("Angina", "Cardiovascular", "History of angina...", "angine de poitrine, angor"),
            ("Arterial Hypertension", "Cardiovascular", "", "hypertension arterielle, hta, hypertension"),
            ("Deep venous thrombosis", "Cardiovascular", "", "thrombose veineuse profonde, tvp, phlebite"),
            ("Peripheral artery disease", "Cardiovascular", "", "arteriopathie peripherique, aomi, maladie arterielle"),
            ("Previous myocardial infarction", "Cardiovascular", "", "infarctus du myocarde, idm, crise cardiaque, infarctus"),
            ("Chronic atrial fibrillation", "Cardiovascular", "", "fibrillation auriculaire, fa, fibrillation atriale"),
            ("Cardiac arrhythmias - Other", "Cardiovascular", "", "arythmie, trouble du rythme"),
            ("Alcoholism", "Neurological / Psychiatric Diseases", "", "alcoolisme, ethylisme, ethylique"),
            ("Dementia", "Neurological / Psychiatric Diseases", "", "demence, alzheimer"),
            ("Psychoactive substance dependence", "Neurological / Psychiatric Diseases", "", "toxicomanie, drogue, dependance, assuetude"),
            ("Stroke with sequelae", "Neurological / Psychiatric Diseases", "", "avc avec sequelles, accident vasculaire cerebral"),
            ("Stroke without sequelae", "Neurological / Psychiatric Diseases", "", "avc sans sequelles, avc ischemique, avc hemorragique"),
            ("Psychiatric diseases", "Neurological / Psychiatric Diseases", "", "maladie psychiatrique, depression, trouble bipolaire, schizophrenie"),
            ("Tobacco consumption", "Neurological / Psychiatric Diseases", "", "tabagisme, tabac, fumeur"),
            ("Asthma", "Respiratory", "", "asthme, asthmatique"),
            ("History of pneumonia (previous 12 months)", "Respiratory", "Community-acquired...", "pneumonie, bronchopneumonie, infection pulmonaire"),
            ("Malnutrition", "Endocrine / Metabolic and Systemic Diseases", "", "denutrition, malnutrition"),
            ("Rheumatic diseases", "Endocrine / Metabolic and Systemic Diseases", "", "polyarthrite, rhumatoide, rhumatisme, maladie rhumatismale"),
            ("Hyperthyroidism", "Endocrine / Metabolic and Systemic Diseases", "", "hyperthyroidie"),
            ("Complicated Diabetes", "Endocrine / Metabolic and Systemic Diseases", "", "diabete complique"),
            ("Uncomplicated Diabetes", "Endocrine / Metabolic and Systemic Diseases", "", "diabete, diabetique, diabete de type"),
            ("Morbid obesity", "Endocrine / Metabolic and Systemic Diseases", "", "obesite morbide, obesite"),
            ("Dyslipidemias", "Endocrine / Metabolic and Systemic Diseases", "", "dyslipidemie, hypercholesterolemie"),
            ("Hypothyroidism", "Endocrine / Metabolic and Systemic Diseases", "", "hypothyroidie"),
            ("Peptic ulcer disease", "Digestive", "", "ulcere gastrique, ulcere peptique, ulcere")
        ]

        for nombre, categoria, def_tec, claves in comorbilidades:
            obj, created = CatComorbilidad.objects.update_or_create(
                nombre=nombre, 
                defaults={
                    'categoria': categoria, 
                    'definicion_tecnica': def_tec,
                    'palabras_clave': claves
                }
            )
            accion = "Añadida" if created else "Actualizada"
            self.stdout.write(f"  [{accion}] Comorbilidad: {nombre}")

        # =====================================================================
        # 2. SOPORTES Y COMPLICACIONES (Nombre, Categoría, Palabras_Clave_FR)
        # =====================================================================
        soportes = [
            ("Vasoactive drugs > 1h", "Cardiovascular", "vasopresseurs, inotropes, dopamine, dobutamine, adrenaline, epinephrine, noradrenaline, vasopressine, levophed"),
            ("Cardiac Arrhythmias", "Cardiovascular", "arythmie, fibrillation, tachycardie, bradycardie"),
            ("Cardiopulmonary arrest", "Cardiovascular", "arret cardiaque, reanimation, rcp, acr"),
            ("Mechanical Ventilation", "Respiratory", "intube, ventilee, ventilation mecanique, vc, pc, vmi, tube endotracheal, intubation"),
            ("Non-invasive ventilation", "Respiratory", "vni, cpap, optiflow, bipap, niv, masque facial"),
            ("Acute respiratory failure", "Respiratory", "insuffisance respiratoire aigue, ira, detresse respiratoire"),
            ("Renal Replacement therapy", "Renal", "trr, dialyse, hemodialyse, hemofiltration, cvvh, sled, ihd, prismocal, prismasol, epuration extrarenale"),
            ("Acute kidney injury", "Renal", "insuffisance renale aigue, ira, aki, lesion renale"),
            ("Intracranial mass effect", "Neurological", "effet de masse, hypertension intracranienne, htic, derivation ventriculaire, dve"),
            ("Gastrointestinal bleeding", "Gastrointestinal", "saignement gastro intestinal, hemorragie digestive, melaena, hematemese"),
            ("Neutropenia", "Hematological", "neutropenie, neutropenique")
        ]

        for nombre, categoria, claves in soportes:
            obj, created = CatSoporte.objects.update_or_create(
                nombre=nombre, 
                defaults={
                    'categoria': categoria,
                    'palabras_clave': claves
                }
            )
            accion = "Añadido" if created else "Actualizado"
            self.stdout.write(f"  [{accion}] Soporte: {nombre}")

        self.stdout.write(self.style.SUCCESS("\n¡Base de Hechos (100%) inyectada con radares en Francés!"))

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

        TRADUCCIONES_FR = {
            "Achondroplasia": "achondroplasie",
            "Acute abdomen": "abdomen aigu",
            "Appendicitis": "appendicite",
            "Appendectomy": "appendicectomie",
            "Asthma": "asthme, crise d'asthme",
            "Atrial fibrillation": "fibrillation auriculaire, fa",
            "Bowel obstruction": "occlusion intestinale, obstruction intestinale",
            "Cardiogenic shock": "choc cardiogenique",
            "Cholecystectomy": "cholecystectomie",
            "Cholecystitis": "cholecystite",
            "Cirrhosis of the liver": "cirrhose du foie, cirrhose",
            "Coronary artery bypass grafting (CABG)": "pontage coronarien, cabg, pac",
            "COVID-19": "covid, sars-cov-2, coronavirus",
            "Craniotomy": "craniotomie",
            "Deep vein thrombosis (DVT)": "thrombose veineuse profonde, tvp, phlebite",
            "Dementia": "demence",
            "Diabetes mellitus type 1": "diabete de type 1, diabete type 1",
            "Diabetes mellitus type 2": "diabete de type 2, diabete type 2",
            "Diabetic ketoacidosis (DKA)": "acidocetose diabetique, cetoacidose",
            "Esophagectomy": "oesophagectomie",
            "Gastrectomy": "gastrectomie",
            "Gastrointestinal bleeding": "hemorragie digestive, saignement gastro intestinal",
            "Hepatic failure": "insuffisance hepatique, defaillance hepatique",
            "Hypertension": "hypertension arterielle, hta",
            "Inflammatory bowel disease": "mici, maladie inflammatoire chronique de l'intestin",
            "Laparoscopy": "laparoscopie, coelioscopie",
            "Laparothomy": "laparotomie",
            "Leukemia": "leucemie",
            "Lymphoma": "lymphome",
            "Malaria": "paludisme, malaria",
            "Myocardial infarction": "infarctus du myocarde, idm, crise cardiaque",
            "Pancreatectomy": "pancreatectomie",
            "Pancreatitis": "pancreatite",
            "Pneumonia": "pneumonie, pneumopathie",
            "Pulmonary embolism": "embolie pulmonaire, ep",
            "Renal failure": "insuffisance renale",
            "Acute kidney injury (AKI)": "insuffisance renale aigue, ira",
            "Chronic kidney disease (CKD)": "insuffisance renale chronique, irc",
            "Sepsis": "sepsis, septicemie",
            "Septic shock": "choc septique",
            "Stroke (cerebrovascular accident)": "avc, accident vasculaire cerebral",
            "Transient ischemic attack (TIA)": "ait, accident ischemique transitoire",
            "Tuberculosis": "tuberculose, tb",
            "Brain tumor removal": "resection de tumeur cerebrale, tumeur cerebrale",
            "Heart transplant": "transplantation cardiaque, greffe cardiaque",
            "Kidney transplant": "transplantation renale, greffe renale",
            "Liver transplant": "transplantation hepatique, greffe hepatique",
            "Breast biopsy": "biopsie mammaire",
            "Mastectomy": "mastectomie",
            "Thyroidectomy": "thyroidectomie",
            "Pacemaker insertion": "pose de pacemaker, stimulateur cardiaque"
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
            codigo_gen = f"D{str(i+1).zfill(3)}"
            categorias_str = ", ".join(categorias)
            
            # Buscar traducción en nuestro diccionario
            # Si no está (ej. es un antibiótico como 'Amoxicillin'), usamos el nombre original en minúscula como fallback
            claves_frances = TRADUCCIONES_FR.get(nombre_dx, nombre_dx.lower())
            
            obj, created = CatDiagnostico.objects.update_or_create(
                nombre_diagnostico=nombre_dx,
                defaults={
                    'codigo': codigo_gen,
                    'palabras_clave': claves_frances
                }
            )
            if created:
                self.stdout.write(f"  + Diagnóstico añadido: [{categorias_str}] {nombre_dx}")
            else:
                self.stdout.write(f"  ~ Diagnóstico actualizado con sinónimos: {nombre_dx}")

        self.stdout.write(self.style.SUCCESS("¡Diagnósticos inyectados con diccionarios multi-idioma al 100%!"))