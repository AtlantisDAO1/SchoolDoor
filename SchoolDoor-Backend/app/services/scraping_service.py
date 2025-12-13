import httpx
import json
import asyncio
from typing import List, Dict, Any
from app.config import settings
from app.models import ScrapingJob, School
from app.database import SessionLocal
from sqlalchemy import func
import logging

"""
Service for scraping school data using external APIs (Perplexity).
Manages scraping jobs, data extraction, and database updates.
"""

logger = logging.getLogger(__name__)


class SchoolScrapingService:
    """
    School scraping service using Perplexity API for web search and data extraction.
    Perplexity provides the best combination of web search and AI-powered data extraction.
    """
    
    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=60.0)
        
        if not settings.perplexity_api_key:
            raise ValueError("PERPLEXITY_API_KEY is required for school scraping")
    
    async def scrape_schools_in_region(self, region: str, job_id: int) -> Dict[str, Any]:
        """Main method to scrape schools in a given region using modern approaches"""
        db = SessionLocal()
        try:
            # Update job status
            job = db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()
            if not job:
                raise ValueError(f"Scraping job {job_id} not found")
            
            job.status = "running"
            job.error_message = "Starting scraping process..."
            db.commit()
            logger.info(f"Starting scraping job {job_id} for region: {region}")
            
            # Step 1: Get existing schools in the region to avoid duplicates
            existing_schools = db.query(School).filter(
                func.lower(School.city) == func.lower(region)
            ).all()
            
            existing_school_names = [school.name for school in existing_schools]
            logger.info(f"Job {job_id}: Found {len(existing_school_names)} existing schools in {region}")
            
            # Step 2: Search for schools using Perplexity API
            job.error_message = f"Searching for schools in {region} using Perplexity API..."
            db.commit()
            logger.info(f"Job {job_id}: Contacting Perplexity API for region: {region}")
            
            schools_data = await self._scrape_with_perplexity(region, existing_school_names)
            
            if not schools_data:
                job.status = "failed"
                job.error_message = f"No schools found in {region}. Please try a different region or check the spelling."
                db.commit()
                logger.warning(f"Job {job_id}: No schools found for region: {region}")
                return {"status": "failed", "error": "No schools found"}
            
            job.schools_found = len(schools_data)
            job.error_message = f"Found {len(schools_data)} schools. Processing data..."
            db.commit()
            logger.info(f"Job {job_id}: Found {len(schools_data)} schools from Perplexity API")
            
            schools_processed = 0
            schools_created = 0
            schools_updated = 0
            errors = []
            
            for i, school_data in enumerate(schools_data, 1):
                try:
                    school_name = school_data.get('name', 'Unknown')
                    # Update progress
                    job.error_message = f"Processing school {i}/{len(schools_data)}: {school_name}"
                    db.commit()
                    logger.info(f"Job {job_id}: Processing school {i}/{len(schools_data)}: {school_name}")
                    
                    # Check if school already exists
                    existing_school = db.query(School).filter(
                        School.name == school_data.get('name'),
                        School.city == school_data.get('city')
                    ).first()
                    
                    if not existing_school:
                        # Create new school
                        school = School(**school_data)
                        db.add(school)
                        schools_created += 1
                        logger.info(f"Job {job_id}: Created new school: {school_name}")
                    else:
                        # Update existing school with new data
                        self._update_school_data(existing_school, school_data)
                        schools_updated += 1
                        logger.info(f"Job {job_id}: Updated existing school: {school_name}")
                    
                    schools_processed += 1
                    job.schools_processed = schools_processed
                    db.commit()
                    
                except Exception as e:
                    error_msg = f"Error processing school {school_data.get('name', 'Unknown')}: {str(e)}"
                    logger.error(f"Job {job_id}: {error_msg}")
                    errors.append(error_msg)
                    continue
            
            # Final status update
            if errors:
                job.error_message = f"Completed with {len(errors)} errors. Created: {schools_created}, Updated: {schools_updated}, Errors: {len(errors)}"
                logger.warning(f"Job {job_id}: Completed with {len(errors)} errors")
            else:
                job.error_message = f"Successfully completed! Created: {schools_created}, Updated: {schools_updated}"
                logger.info(f"Job {job_id}: Successfully completed without errors")
            
            job.status = "completed"
            job.completed_at = func.now()
            db.commit()
            
            logger.info(f"Job {job_id} FINAL RESULTS: {schools_created} created, {schools_updated} updated, {len(errors)} errors")
            
            return {
                "status": "completed",
                "schools_found": len(schools_data),
                "schools_processed": schools_processed,
                "schools_created": schools_created,
                "schools_updated": schools_updated,
                "errors": len(errors),
                "error_details": errors[:5] if errors else []  # Show first 5 errors
            }
            
        except Exception as e:
            logger.error(f"Job {job_id}: CRITICAL ERROR: {str(e)}")
            job.status = "failed"
            job.error_message = f"Scraping failed: {str(e)}"
            db.commit()
            return {"status": "failed", "error": str(e)}
        finally:
            db.close()
    
    async def _scrape_with_perplexity(self, region: str, existing_school_names: List[str] = None, max_retries: int = 3) -> List[Dict[str, Any]]:
        """Use Perplexity API to find and extract school data with retry logic"""
        for attempt in range(max_retries):
            try:
                logger.info(f"Perplexity API: Starting search for schools in {region} (attempt {attempt + 1}/{max_retries})")
                # Perplexity is excellent for this - it can search and extract data in one call
                # Build the prompt with existing schools exclusion
                existing_schools_text = ""
                if existing_school_names:
                    existing_schools_text = f"""
            
            IMPORTANT: Do NOT include these schools that are already in our database:
            {', '.join(existing_school_names[:20])}  # Show first 20 to avoid token limits
            """
                
                prompt = f"""
            Find schools specifically located in {region}, India. IMPORTANT: Only include schools that are actually located in {region} city/area, not other cities.
            {existing_schools_text}
            
            For each school, provide:
            - Name
            - Address (street, city, state, pincode) - MUST be in {region}
            - Phone number
            - Website URL
            - School type (CBSE, ICSE, State Board, IB, IGCSE, etc.)
            - Board affiliation (CBSE, ICSE, State Board, IB, IGCSE)
            - Grade levels (Nursery to 12, Pre-K to 10, etc.)
            - Enrollment (approximate)
            - Student-teacher ratio
            - Medium of instruction (English, Hindi, Regional language)
            - Principal name
            - Special programs offered
            - Facilities (sports, arts, technology, labs)
            - Board exam results (10th/12th pass percentage)
            - Competitive exam results (JEE, NEET, etc.)
            
            CRITICAL: Return ONLY a valid JSON array. Do not include any text, explanations, or formatting outside the JSON.
            Start your response with [ and end with ]. Focus on finding NEW schools not already listed above.
            Include at least 5-10 new schools if available, or return empty array [] if no new schools found.
            
            Example format:
            [
              {{
                "name": "School Name",
                "address": "Full Address",
                "city": "{region}",
                "state": "State",
                "pincode": "123456",
                "phone": "Phone Number",
                "website": "https://website.com",
                "school_type": "CBSE",
                "board": "CBSE",
                "grade_levels": "Nursery to 12",
                "enrollment": 1000,
                "student_teacher_ratio": "20:1",
                "medium_of_instruction": "English",
                "principal_name": "Principal Name",
                "special_programs": "Programs",
                "facilities": "Facilities",
                "board_exam_results": "95%",
                "competitive_exam_results": "JEE, NEET results"
              }}
            ]
            """
                
                headers = {
                    "Authorization": f"Bearer {settings.perplexity_api_key}",
                    "Content-Type": "application/json"
                }
                
                data = {
                    "model": "sonar-pro",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert at finding and extracting school information. Always return valid JSON."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": 4000,
                    "temperature": 0.1
                }
                
                logger.info(f"Perplexity API: Sending request for {region}")
                response = await self.http_client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers=headers,
                    json=data
                )
                
                logger.info(f"Perplexity API: Received response with status {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    content = result['choices'][0]['message']['content'].strip()
                    
                    # Log the first 200 characters for debugging
                    logger.info(f"Perplexity API response preview for {region}: {content[:200]}...")
                    
                    # Try direct JSON parsing first
                    try:
                        schools_data = json.loads(content)
                        if isinstance(schools_data, list) and len(schools_data) > 0:
                            logger.info(f"Perplexity API: Successfully parsed {len(schools_data)} schools directly for {region}")
                            return self._clean_schools_data(schools_data, region)
                    except json.JSONDecodeError:
                        pass
                    
                    # If direct parsing fails, try the robust extraction
                    schools_data = self._extract_json_from_content(content, region)
                    if schools_data:
                        logger.info(f"Perplexity API: Successfully extracted {len(schools_data)} schools for {region}")
                        return self._clean_schools_data(schools_data, region)
                    else:
                        logger.warning(f"Perplexity API: Could not extract valid JSON from response for {region}")
                        return []
                elif response.status_code == 401:
                    logger.error(f"Perplexity API: Invalid API key for {region}")
                    raise Exception("Invalid Perplexity API key. Please check your API key in the environment configuration.")
                elif response.status_code == 429:
                    logger.error(f"Perplexity API: Rate limit exceeded for {region}")
                    raise Exception("Perplexity API rate limit exceeded. Please try again later.")
                elif response.status_code == 400:
                    error_detail = response.json().get('error', {}).get('message', 'Bad request')
                    logger.error(f"Perplexity API: Bad request for {region}: {error_detail}")
                    raise Exception(f"Perplexity API error: {error_detail}")
                else:
                    logger.error(f"Perplexity API: HTTP {response.status_code} for {region}")
                    raise Exception(f"Perplexity API error: HTTP {response.status_code}")
                    
            except httpx.TimeoutException:
                logger.warning(f"Perplexity API: Request timed out for {region} (attempt {attempt + 1}/{max_retries})")
                if attempt == max_retries - 1:
                    raise Exception("Perplexity API request timed out after multiple attempts. Please try again.")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
                continue
            except httpx.ConnectError:
                logger.warning(f"Perplexity API: Connection error for {region} (attempt {attempt + 1}/{max_retries})")
                if attempt == max_retries - 1:
                    raise Exception("Could not connect to Perplexity API. Please check your internet connection.")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
                continue
            except json.JSONDecodeError as e:
                logger.error(f"Perplexity API: JSON decode error for {region}: {str(e)}")
                raise Exception(f"Failed to parse Perplexity API response: {str(e)}")
            except Exception as e:
                logger.error(f"Perplexity API: Unexpected error for {region}: {e}")
                raise Exception(f"Perplexity API error: {str(e)}")
        
        # If we get here, all retries failed
        raise Exception("Perplexity API failed after all retry attempts")
    
    def _extract_json_from_content(self, content: str, region: str) -> List[Dict[str, Any]]:
        """Extract JSON array from Perplexity response content with robust parsing"""
        try:
            # Clean the content first
            content = content.strip()
            
            # Method 1: Try to find JSON array boundaries
            json_start = content.find('[')
            json_end = content.rfind(']') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = content[json_start:json_end]
                try:
                    schools_data = json.loads(json_str)
                    if isinstance(schools_data, list) and len(schools_data) > 0:
                        logger.info(f"Method 1: Found {len(schools_data)} schools using array boundaries")
                        return schools_data
                except json.JSONDecodeError:
                    pass
            
            # Method 2: Try to find the largest valid JSON array
            import re
            # Look for JSON arrays that start with [ and end with ]
            json_pattern = r'\[(?:[^\[\]]*|\[[^\[\]]*\])*\]'
            matches = re.findall(json_pattern, content, re.DOTALL)
            
            for match in matches:
                try:
                    schools_data = json.loads(match)
                    if isinstance(schools_data, list) and len(schools_data) > 0:
                        logger.info(f"Method 2: Found {len(schools_data)} schools using regex pattern")
                        return schools_data
                except json.JSONDecodeError:
                    continue
            
            # Method 3: Try to extract individual JSON objects and build array
            json_objects = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content, re.DOTALL)
            if json_objects:
                schools_data = []
                for obj_str in json_objects:
                    try:
                        obj = json.loads(obj_str)
                        if isinstance(obj, dict) and obj.get('name'):
                            schools_data.append(obj)
                    except json.JSONDecodeError:
                        continue
                if schools_data:
                    logger.info(f"Method 3: Found {len(schools_data)} schools using individual objects")
                    return schools_data
            
            # Method 4: Try to find JSON after common prefixes
            prefixes = ['Here are the schools:', 'Schools in', 'The schools are:', 'JSON:', '```json', '```']
            for prefix in prefixes:
                if prefix.lower() in content.lower():
                    start_idx = content.lower().find(prefix.lower()) + len(prefix)
                    remaining = content[start_idx:].strip()
                    if remaining.startswith('['):
                        json_end = remaining.find(']') + 1
                        if json_end > 0:
                            json_str = remaining[:json_end]
                            try:
                                schools_data = json.loads(json_str)
                                if isinstance(schools_data, list) and len(schools_data) > 0:
                                    logger.info(f"Method 4: Found {len(schools_data)} schools after prefix '{prefix}'")
                                    return schools_data
                            except json.JSONDecodeError:
                                continue
            
            logger.warning(f"Could not extract valid JSON from Perplexity response for {region}")
            logger.info(f"Content length: {len(content)} characters")
            return []
            
        except Exception as e:
            logger.error(f"Error extracting JSON for {region}: {str(e)}")
            return []
    
    def _clean_schools_data(self, schools_data: List[Dict[str, Any]], requested_region: str = None) -> List[Dict[str, Any]]:
        """Clean and validate extracted school data"""
        cleaned_schools = []
        
        for school in schools_data:
            if not school.get('name'):
                continue
            
            # Check if school is from the requested region
            if requested_region:
                school_city = school.get('city', '').lower().strip()
                school_address = school.get('address', '').lower().strip()
                requested_region_lower = requested_region.lower().strip()
                
                # Check if the school is actually from the requested region
                if (requested_region_lower not in school_city and 
                    requested_region_lower not in school_address and
                    school_city != requested_region_lower):
                    logger.warning(f"Filtering out school from wrong region: {school.get('name')} (city: {school_city}, requested: {requested_region_lower})")
                    continue
                
            cleaned = {}
            
            # Clean string fields (Indian school system)
            string_fields = ['name', 'address', 'city', 'state', 'zip_code', 'phone', 'email', 'website', 
                            'school_type', 'board', 'grade_levels', 'principal_name', 'medium_of_instruction']
            
            for field in string_fields:
                value = school.get(field)
                if value and isinstance(value, str):
                    cleaned[field] = value.strip()
                else:
                    cleaned[field] = None
            
            # Clean numeric fields
            numeric_fields = ['enrollment', 'student_teacher_ratio']
            for field in numeric_fields:
                value = school.get(field)
                if value is not None:
                    try:
                        cleaned[field] = float(value)
                    except (ValueError, TypeError):
                        cleaned[field] = None
                else:
                    cleaned[field] = None
            
            # Clean list fields
            if school.get('programs') and isinstance(school['programs'], list):
                cleaned['programs'] = [str(p).strip() for p in school['programs'] if p]
            else:
                cleaned['programs'] = None
            
            # Clean facilities
            facilities = school.get('facilities')
            if facilities and isinstance(facilities, dict):
                cleaned_facilities = {}
                for category, items in facilities.items():
                    if isinstance(items, list):
                        cleaned_facilities[category] = [str(item).strip() for item in items if item]
                cleaned['facilities'] = cleaned_facilities if cleaned_facilities else None
            else:
                cleaned['facilities'] = None
            
            # Clean Indian-specific fields
            if school.get('board_exam_results') and isinstance(school['board_exam_results'], dict):
                cleaned['board_exam_results'] = school['board_exam_results']
            else:
                cleaned['board_exam_results'] = None
            
            if school.get('competitive_exam_results') and isinstance(school['competitive_exam_results'], dict):
                cleaned['competitive_exam_results'] = school['competitive_exam_results']
            else:
                cleaned['competitive_exam_results'] = None
            
            # Set default country to India
            cleaned['country'] = 'India'
            
            cleaned_schools.append(cleaned)
        
        return cleaned_schools
    
    def _update_school_data(self, existing_school: School, new_data: Dict[str, Any]) -> None:
        """Smart update of existing school data - only updates non-null values"""
        updated_fields = []
        
        # Update basic information
        string_fields = ['address', 'phone', 'email', 'website', 'school_type', 
                        'grade_levels', 'principal_name']
        
        for field in string_fields:
            new_value = new_data.get(field)
            if new_value and new_value != getattr(existing_school, field):
                setattr(existing_school, field, new_value)
                updated_fields.append(field)
        
        # Update numeric fields (only if new value is not None and different)
        numeric_fields = ['enrollment', 'student_teacher_ratio', 'graduation_rate', 'established_year']
        for field in numeric_fields:
            new_value = new_data.get(field)
            if new_value is not None and new_value != getattr(existing_school, field):
                setattr(existing_school, field, new_value)
                updated_fields.append(field)
        
        # Update JSON fields (merge or replace)
        json_fields = ['test_scores', 'programs', 'facilities']
        for field in json_fields:
            new_value = new_data.get(field)
            if new_value is not None:
                existing_value = getattr(existing_school, field) or {}
                if isinstance(new_value, dict) and isinstance(existing_value, dict):
                    # Merge dictionaries
                    merged = {**existing_value, **new_value}
                    setattr(existing_school, field, merged)
                    updated_fields.append(field)
                elif new_value != existing_value:
                    # Replace completely
                    setattr(existing_school, field, new_value)
                    updated_fields.append(field)
        
        # Update city/state if more specific
        if new_data.get('city') and new_data.get('state'):
            if not existing_school.city or not existing_school.state:
                existing_school.city = new_data['city']
                existing_school.state = new_data['state']
                updated_fields.extend(['city', 'state'])
        
        # Always update the last scraped timestamp
        from sqlalchemy import func
        existing_school.last_scraped_at = func.now()
        
        if updated_fields:
            logger.info(f"Updated school {existing_school.name}: {', '.join(updated_fields)}")
        else:
            logger.info(f"No updates needed for school {existing_school.name}")


# Service instance
scraping_service = SchoolScrapingService()
